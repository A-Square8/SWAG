/**
 * Video Renderer — renders vertical Instagram Reels using Playwright cards, Edge TTS narration,
 * and FFmpeg video assembly.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, rm } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import type {
  ReelPlan,
  ReelRenderResult,
  YouTubeVideoPlan,
  YouTubeRenderResult,
} from "../../../types/index.js";
import { ThemeEngine } from "../../theme/index.js";
import { BrandKitManager } from "../../brand/index.js";
import { AssetManager } from "../../assets/index.js";
import { OutputManager } from "../../output/index.js";
import { TTSManager } from "../../tts/index.js";
import { getAudioDuration } from "../../tts/audio-utils.js";
import { generateReelSceneHtml } from "./templates.js";
import { generateYouTubeSectionHtml } from "./youtube-templates.js";
import { SoothingMusicGenerator } from "./music.js";
import { generateSrt, type SubtitleEntry } from "../subtitles.js";
import {
  generateChapters,
  formatChaptersForDescription,
  type Chapter,
} from "../chapters.js";
import { ensureDir, join, pathExists, safeWriteFile, resolvePath, fileToDataUrl } from "../../../utils/fs.js";
import { analyzeProject } from "../../analyzer/index.js";
import { SwagError } from "../../../utils/errors.js";
import { logger } from "../../../utils/logger.js";

const execFileAsync = promisify(execFile);
const log = logger.child("renderer:video");

export interface RenderReelOptions {
  projectPath: string;
  plan: ReelPlan;
  preview?: boolean;
}

export class VideoRenderer {
  /**
   * Render an Instagram Reel video plan to vertical MP4 with narration audio.
   */
  public static async renderInstagramReel(
    options: RenderReelOptions,
  ): Promise<ReelRenderResult> {
    const { projectPath, plan, preview = false } = options;

    log.info(
      `Rendering Instagram Reel (${plan.scenes.length} scenes, target ${plan.targetDuration}s) for: ${projectPath}`,
    );

    // 1. Load theme & brand kit
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);

    // 2. Prepare output folder
    const folderInfo = await OutputManager.getNextVersionFolder(
      projectPath,
      "instagram-reel",
    );

    const tempClipsDir = join(folderInfo.dirPath, "temp-clips");
    await ensureDir(tempClipsDir);

    // 3. Launch Playwright
    let browser: Browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      throw new SwagError(
        "RENDER_FAILED",
        `Failed to launch browser for Reel scene rendering: ${err instanceof Error ? err.message : String(err)}`,
        "Run 'npx playwright install chromium'.",
      );
    }

    const clipPaths: string[] = [];
    let totalDuration = 0;

    // Detect project tech stack for dynamic badges
    let projectTechStack: string[] | undefined;
    try {
      const analysis = await analyzeProject({ projectPath });
      if (analysis?.profile?.techStack?.length) {
        projectTechStack = analysis.profile.techStack.map((t) => t.name);
      }
    } catch {
      // Fall back gracefully
    }

    try {
      const scaleFactor = 1;
      const context = await browser.newContext({
        viewport: { width: 1080, height: 1920 },
        deviceScaleFactor: scaleFactor,
      });
      const page = await context.newPage();

      // Read logo if available
      let logoDataUrl: string | undefined;
      const logoFilePath = await BrandKitManager.resolveLogoFilePath(projectPath, brandKit);
      if (logoFilePath) {
        const dataUrl = await fileToDataUrl(logoFilePath);
        if (dataUrl) {
          logoDataUrl = dataUrl;
          log.info(`Resolved brand logo for Reel: ${logoFilePath}`);
        }
      }

      // 4. Process each scene
      for (let i = 0; i < plan.scenes.length; i++) {
        const scene = plan.scenes[i];
        const sceneIndex = i;
        const clipPrefix = `scene-${String(i + 1).padStart(2, "0")}`;

        // A. Generate scene narration audio
        const audioPath = join(tempClipsDir, `${clipPrefix}.mp3`);
        const narrationText =
          scene.content.narrationText || scene.content.text || `Scene ${i + 1}`;

        const audioResult = await TTSManager.synthesize({
          text: narrationText,
          outputFilePath: audioPath,
        });

        const audioDur = audioResult.durationSeconds;
        const sceneDuration =
          audioDur > 0
            ? Math.max(Math.ceil(audioDur + 0.6), 3)
            : Math.max(scene.duration || 4, 3);
        totalDuration += sceneDuration;

        // B. Render scene visual
        let videoAssetPath: string | undefined;
        let assetDataUrl: string | undefined;
        let isMobileAsset = false;

        if (scene.content.assetId) {
          const asset = await AssetManager.getAsset(projectPath, scene.content.assetId);
          if (asset) {
            if (
              asset.metadata?.device === "mobile" ||
              (asset.metadata?.width && asset.metadata?.height && asset.metadata.width < asset.metadata.height)
            ) {
              isMobileAsset = true;
            }
            const assetPath = resolvePath(projectPath, asset.filePath);
            if (await pathExists(assetPath)) {
              if (
                asset.type === "recording" ||
                asset.filePath.endsWith(".webm") ||
                asset.filePath.endsWith(".mp4")
              ) {
                videoAssetPath = assetPath;
              } else {
                const dataUrl = await fileToDataUrl(assetPath);
                if (dataUrl) assetDataUrl = dataUrl;
              }
            }
          }
        }

        const html = generateReelSceneHtml({
          scene,
          sceneIndex,
          totalScenes: plan.scenes.length,
          theme,
          brandKit,
          assetDataUrl,
          logoDataUrl,
          isMobileAsset,
          projectTechStack,
        });

        await page.setContent(html, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(200);

        // Measure mockup viewport box if video asset is present
        let videoBox: { x: number; y: number; width: number; height: number } | null = null;
        if (videoAssetPath) {
          try {
            const locator = page.locator(".mockup-viewport");
            if ((await locator.count()) > 0) {
              const b = await locator.first().boundingBox();
              if (b && b.width > 50 && b.height > 50) {
                videoBox = {
                  x: Math.round(b.x * scaleFactor),
                  y: Math.round(b.y * scaleFactor),
                  width: Math.floor((b.width * scaleFactor) / 2) * 2,
                  height: Math.floor((b.height * scaleFactor) / 2) * 2,
                };
              }
            }
          } catch (boxErr) {
            log.debug(`Could not measure reel mockup viewport: ${boxErr}`);
          }
          if (!videoBox) {
            videoBox = { x: 48, y: 380, width: 984, height: 1132 };
          }
        }

        const sceneImagePath = join(tempClipsDir, `${clipPrefix}.png`);
        await page.screenshot({ path: sceneImagePath, type: "png" });

        // C. Render scene MP4 with FFmpeg
        const sceneVideoPath = join(tempClipsDir, `${clipPrefix}.mp4`);
        log.info(
          `Generating scene video ${i + 1}/${plan.scenes.length} (${sceneDuration}s)${videoAssetPath ? " with real demo video" : ""}...`,
        );

        if (videoAssetPath && videoBox) {
          await execFileAsync("ffmpeg", [
            "-loop",
            "1",
            "-i",
            sceneImagePath,
            "-stream_loop",
            "-1",
            "-i",
            videoAssetPath,
            "-i",
            audioPath,
            "-filter_complex",
            `[1:v]scale=${videoBox.width}:${videoBox.height}:force_original_aspect_ratio=decrease,pad=${videoBox.width}:${videoBox.height}:(ow-iw)/2:(oh-ih)/2:color=black[scaledvid];[0:v][scaledvid]overlay=${videoBox.x}:${videoBox.y}:shortest=1[outv];[2:a]apad[outa]`,
            "-map",
            "[outv]",
            "-map",
            "[outa]",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-pix_fmt",
            "yuv420p",
            "-t",
            String(sceneDuration),
            "-r",
            "30",
            sceneVideoPath,
            "-y",
          ]);
        } else {
          await execFileAsync("ffmpeg", [
            "-loop",
            "1",
            "-i",
            sceneImagePath,
            "-i",
            audioPath,
            "-af",
            "apad",
            "-c:v",
            "libx264",
            "-tune",
            "stillimage",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-pix_fmt",
            "yuv420p",
            "-t",
            String(sceneDuration),
            "-r",
            "30",
            sceneVideoPath,
            "-y",
          ]);
        }

        clipPaths.push(sceneVideoPath);
      }

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    // 5. Concatenate all scene clips into final MP4
    const finalMp4Path = join(folderInfo.dirPath, "reel.mp4");
    log.info(`Concatenating ${clipPaths.length} clips into final Reel MP4...`);

    const concatListContent = clipPaths.map((p) => `file '${p}'`).join("\n");
    const concatListFile = join(tempClipsDir, "concat.txt");
    await safeWriteFile(concatListFile, concatListContent);

    try {
      await execFileAsync("ffmpeg", [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListFile,
        "-c",
        "copy",
        finalMp4Path,
        "-y",
      ]);
    } catch (concatErr) {
      // If copy fails due to any codec mismatch, re-encode
      log.warn(`Stream copy concat failed, re-encoding: ${concatErr}`);
      await execFileAsync("ffmpeg", [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListFile,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        finalMp4Path,
        "-y",
      ]);
    }

    // Clean up temporary clip files
    await rm(tempClipsDir, { recursive: true, force: true }).catch(() => {});

    // 6. Write metadata.json
    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "instagram-reel",
      actualDuration: totalDuration,
      targetDuration: plan.targetDuration,
      sceneCount: plan.scenes.length,
      caption: plan.caption,
      hashtags: plan.hashtags,
      captions: plan.captions,
      scenes: plan.scenes,
      filePath: finalMp4Path,
    });

    log.info(
      `Reel render completed: ${finalMp4Path} (${totalDuration}s, v${folderInfo.version})`,
    );

    return {
      success: true,
      outputPath: finalMp4Path,
      metadataPath: folderInfo.metadataPath,
      actualDuration: totalDuration,
      version: folderInfo.version,
    };
  }

  /**
   * Render a widescreen 16:9 narrated YouTube walkthrough video with subtitles and chapters.
   */
  public static async renderYouTubeVideo(options: {
    projectPath: string;
    plan: YouTubeVideoPlan;
    preview?: boolean;
  }): Promise<YouTubeRenderResult> {
    const { projectPath, plan, preview = false } = options;

    log.info(
      `Rendering YouTube video (${plan.sections.length} sections) for: ${projectPath}`,
    );

    // 1. Load theme & brand kit
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);

    // 2. Prepare output folder (e.g. swag-output/youtube/v1/)
    const folderInfo = await OutputManager.getNextVersionFolder(
      projectPath,
      "youtube",
    );

    const tempClipsDir = join(folderInfo.dirPath, "temp-clips");
    await ensureDir(tempClipsDir);

    // 3. Launch browser
    let browser: Browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      throw new SwagError(
        "RENDER_FAILED",
        `Could not launch browser for YouTube video render: ${err instanceof Error ? err.message : String(err)}`,
        "Run 'npx playwright install chromium'.",
      );
    }

    const clipPaths: string[] = [];
    const subtitles: SubtitleEntry[] = [];
    const chapterList: Array<{ title: string; startTimeSec: number }> = [];
    const scriptMarkdownLines: string[] = [
      `# ${plan.title}`,
      "",
      `> ${plan.description}`,
      "",
      "---",
      "",
    ];

    let currentTimeSec = 0;

    // Detect project tech stack for dynamic badges
    let projectTechStack: string[] | undefined;
    try {
      const analysis = await analyzeProject({ projectPath });
      if (analysis?.profile?.techStack?.length) {
        projectTechStack = analysis.profile.techStack.map((t) => t.name);
      }
    } catch {
      // Fall back gracefully
    }

    try {
      const scaleFactor = 1;
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: scaleFactor,
      });
      const page = await context.newPage();

      // Read logo if available
      let logoDataUrl: string | undefined;
      const logoFilePath = await BrandKitManager.resolveLogoFilePath(projectPath, brandKit);
      if (logoFilePath) {
        const dataUrl = await fileToDataUrl(logoFilePath);
        if (dataUrl) {
          logoDataUrl = dataUrl;
          log.info(`Resolved brand logo for YouTube: ${logoFilePath}`);
        }
      }

      // 4. Render each section
      for (let i = 0; i < plan.sections.length; i++) {
        const section = plan.sections[i];
        const clipPrefix = `section-${String(i + 1).padStart(2, "0")}`;

        // A. Record chapter marker
        chapterList.push({
          title: section.title,
          startTimeSec: currentTimeSec,
        });

        // B. Record script markdown
        scriptMarkdownLines.push(
          `## Section ${i + 1}: ${section.title}`,
          "",
          section.narrationText,
          "",
        );

        // C. Synthesize narration audio
        const audioPath = join(tempClipsDir, `${clipPrefix}.mp3`);
        const audioResult = await TTSManager.synthesize({
          text: section.narrationText,
          outputFilePath: audioPath,
        });

        const audioDur = audioResult.durationSeconds;
        const sectionDuration =
          audioDur > 0
            ? Math.max(Math.ceil(audioDur + 0.8), 3)
            : Math.max(section.estimatedDuration || 8, 4);

        // D. Record subtitle entry
        subtitles.push({
          index: i + 1,
          startTimeSec: currentTimeSec,
          endTimeSec: currentTimeSec + audioResult.durationSeconds,
          text: section.narrationText,
        });

        // E. Render section visual (supporting both video recordings and static screenshots)
        let videoAssetPath: string | undefined;
        let assetDataUrl: string | undefined;
        let isMobileAsset = false;

        if (section.assetIds && section.assetIds.length > 0) {
          for (const aid of section.assetIds) {
            const asset = await AssetManager.getAsset(projectPath, aid);
            if (asset) {
              if (
                asset.metadata?.device === "mobile" ||
                (asset.metadata?.width && asset.metadata?.height && asset.metadata.width < asset.metadata.height)
              ) {
                isMobileAsset = true;
              }
              const fullPath = resolvePath(projectPath, asset.filePath);
              if (await pathExists(fullPath)) {
                if (
                  asset.type === "recording" ||
                  asset.filePath.endsWith(".webm") ||
                  asset.filePath.endsWith(".mp4")
                ) {
                  videoAssetPath = fullPath;
                  break;
                } else if (!assetDataUrl) {
                  const dataUrl = await fileToDataUrl(fullPath);
                  if (dataUrl) assetDataUrl = dataUrl;
                }
              }
            }
          }
        }

        // Auto-detect demo recording for demo or features sections if not explicitly referenced
        if (
          !videoAssetPath &&
          (section.section === "demo" || section.section === "features")
        ) {
          const allAssets = await AssetManager.listAssets(projectPath);
          const recordingAsset = allAssets.find(
            (a) =>
              a.type === "recording" ||
              a.filePath.endsWith(".webm") ||
              a.filePath.endsWith(".mp4"),
          );
          if (recordingAsset) {
            const fullPath = resolvePath(projectPath, recordingAsset.filePath);
            if (await pathExists(fullPath)) {
              videoAssetPath = fullPath;
            }
          }
        }

        const nextSectionTitle = i + 1 < plan.sections.length ? plan.sections[i + 1].title : undefined;

        const html = generateYouTubeSectionHtml({
          section,
          sectionIndex: i,
          totalSections: plan.sections.length,
          theme,
          brandKit,
          assetDataUrl,
          hasVideoAsset: Boolean(videoAssetPath),
          logoDataUrl,
          nextSectionTitle,
          projectTechStack,
          isMobileAsset,
        });

        await page.setContent(html, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(200);

        // Measure mockup viewport box if video asset is present
        let videoBox: { x: number; y: number; width: number; height: number } | null = null;
        if (videoAssetPath) {
          try {
            const locator = page.locator(".mockup-viewport");
            if ((await locator.count()) > 0) {
              const b = await locator.first().boundingBox();
              if (b && b.width > 50 && b.height > 50) {
                videoBox = {
                  x: Math.round(b.x * scaleFactor),
                  y: Math.round(b.y * scaleFactor),
                  width: Math.floor((b.width * scaleFactor) / 2) * 2,
                  height: Math.floor((b.height * scaleFactor) / 2) * 2,
                };
              }
            }
          } catch (boxErr) {
            log.debug(`Could not measure youtube mockup viewport: ${boxErr}`);
          }
          if (!videoBox) {
            videoBox = { x: 880, y: 240, width: 940, height: 530 };
          }
        }

        const sectionImagePath = join(tempClipsDir, `${clipPrefix}.png`);
        await page.screenshot({ path: sectionImagePath, type: "png" });

        // F. Render section MP4 with FFmpeg
        const sectionVideoPath = join(tempClipsDir, `${clipPrefix}.mp4`);
        log.info(
          `Generating YouTube section ${i + 1}/${plan.sections.length} (${sectionDuration}s)${videoAssetPath ? " with real project demo video" : ""}...`,
        );

        if (videoAssetPath && videoBox) {
          await execFileAsync("ffmpeg", [
            "-loop",
            "1",
            "-i",
            sectionImagePath,
            "-stream_loop",
            "-1",
            "-i",
            videoAssetPath,
            "-i",
            audioPath,
            "-filter_complex",
            `[1:v]scale=${videoBox.width}:${videoBox.height}:force_original_aspect_ratio=decrease,pad=${videoBox.width}:${videoBox.height}:(ow-iw)/2:(oh-ih)/2:color=black[scaledvid];[0:v][scaledvid]overlay=${videoBox.x}:${videoBox.y}:shortest=1[outv];[2:a]apad[outa]`,
            "-map",
            "[outv]",
            "-map",
            "[outa]",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-pix_fmt",
            "yuv420p",
            "-t",
            String(sectionDuration),
            "-r",
            "30",
            sectionVideoPath,
            "-y",
          ]);
        } else {
          await execFileAsync("ffmpeg", [
            "-loop",
            "1",
            "-i",
            sectionImagePath,
            "-i",
            audioPath,
            "-af",
            "apad",
            "-c:v",
            "libx264",
            "-tune",
            "stillimage",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-pix_fmt",
            "yuv420p",
            "-t",
            String(sectionDuration),
            "-r",
            "30",
            sectionVideoPath,
            "-y",
          ]);
        }

        clipPaths.push(sectionVideoPath);
        currentTimeSec += sectionDuration;
      }

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    // 4.5. Append Raw High-Quality Project Demo Section (after all narrated sections & outro)
    let rawDemoAppended = false;
    let rawDemoDurationSec = 0;
    const isRawDemoEnabled = plan.rawDemo?.enabled !== false;

    if (isRawDemoEnabled) {
      let rawVideoPath: string | undefined;

      // 1. Try explicit videoPath
      if (plan.rawDemo?.videoPath) {
        const directPath = resolvePath(projectPath, plan.rawDemo.videoPath);
        if (await pathExists(directPath)) {
          rawVideoPath = directPath;
        } else {
          log.warn(`Specified raw demo videoPath not found: ${directPath}`);
        }
      }

      // 2. Try explicit assetId
      if (!rawVideoPath && plan.rawDemo?.assetId) {
        const asset = await AssetManager.getAsset(projectPath, plan.rawDemo.assetId);
        if (asset) {
          const assetPath = resolvePath(projectPath, asset.filePath);
          if (await pathExists(assetPath)) {
            rawVideoPath = assetPath;
          }
        }
      }

      // 3. Auto-discover screen recording asset in project
      if (!rawVideoPath) {
        const allAssets = await AssetManager.listAssets(projectPath);
        const recordingAsset = allAssets.find(
          (a) =>
            a.type === "recording" ||
            a.filePath.endsWith(".webm") ||
            a.filePath.endsWith(".mp4"),
        );
        if (recordingAsset) {
          const assetPath = resolvePath(projectPath, recordingAsset.filePath);
          if (await pathExists(assetPath)) {
            rawVideoPath = assetPath;
            log.info(`Auto-detected screen recording asset for raw demo: ${assetPath}`);
          }
        }
      }

      if (rawVideoPath) {
        log.info(`Generating raw high-quality project demo clip from: ${rawVideoPath}`);

        // Determine duration
        let demoDur = plan.rawDemo?.duration;
        if (!demoDur || demoDur <= 0) {
          const measured = await getAudioDuration(rawVideoPath);
          demoDur = measured > 0 ? Math.ceil(measured) : 20;
        }
        rawDemoDurationSec = Math.max(3, demoDur);

        // Resolve soothing background music track
        const soothingMusicPath = await SoothingMusicGenerator.resolveMusicTrack(
          projectPath,
          plan.rawDemo?.musicTrack,
          rawDemoDurationSec,
          join(tempClipsDir, "soothing-ambient.wav"),
        );

        const musicVolume =
          typeof plan.rawDemo?.audioVolume === "number"
            ? plan.rawDemo.audioVolume
            : 0.35;

        const rawDemoClipPath = join(tempClipsDir, "section-raw-demo.mp4");
        const fadeOutStart = Math.max(0, rawDemoDurationSec - 2);

        // Render raw full-size 1920x1080 video with soothing background music and no narration
        await execFileAsync("ffmpeg", [
          "-stream_loop",
          "-1",
          "-i",
          rawVideoPath,
          "-stream_loop",
          "-1",
          "-i",
          soothingMusicPath,
          "-filter_complex",
          `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[outv];[1:a]volume=${musicVolume},afade=t=in:ss=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2,apad[outa]`,
          "-map",
          "[outv]",
          "-map",
          "[outa]",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-pix_fmt",
          "yuv420p",
          "-r",
          "30",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-ar",
          "44100",
          "-ac",
          "2",
          "-t",
          String(rawDemoDurationSec),
          rawDemoClipPath,
          "-y",
        ]);

        clipPaths.push(rawDemoClipPath);

        const demoTitle = plan.rawDemo?.title || "Raw Project Demo (Live Interface)";
        chapterList.push({
          title: demoTitle,
          startTimeSec: currentTimeSec,
        });

        scriptMarkdownLines.push(
          `## Section ${plan.sections.length + 1}: ${demoTitle}`,
          "",
          "*(Raw high-quality project demo — Full size application interface working without narration, accompanied by soothing background music)*",
          "",
        );

        currentTimeSec += rawDemoDurationSec;
        rawDemoAppended = true;
        log.info(`Raw project demo appended (${rawDemoDurationSec}s)`);
      } else {
        log.warn(
          "Raw demo was requested/enabled, but no recording video asset was found in project. Skipping raw demo segment.",
        );
      }
    }

    // 5. Concatenate section clips into final YouTube video
    const finalMp4Path = join(folderInfo.dirPath, "video.mp4");
    log.info(`Concatenating ${clipPaths.length} clips into final YouTube video...`);

    const concatListContent = clipPaths.map((p) => `file '${p}'`).join("\n");
    const concatListFile = join(tempClipsDir, "concat.txt");
    await safeWriteFile(concatListFile, concatListContent);

    try {
      await execFileAsync("ffmpeg", [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListFile,
        "-c",
        "copy",
        finalMp4Path,
        "-y",
      ]);
    } catch {
      await execFileAsync("ffmpeg", [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListFile,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-c:a",
        "aac",
        finalMp4Path,
        "-y",
      ]);
    }

    // Clean up temporary clip files
    await rm(tempClipsDir, { recursive: true, force: true }).catch(() => {});

    // 6. Generate Subtitles (.srt)
    const srtContent = generateSrt(subtitles);
    const srtPath = join(folderInfo.dirPath, "subtitles.srt");
    await safeWriteFile(srtPath, srtContent);

    // 7. Generate Chapters
    const chapters = generateChapters(chapterList);
    const chapterText = formatChaptersForDescription(chapters);

    // 8. Generate Script Markdown
    scriptMarkdownLines.push(
      "---",
      "",
      "### Video Chapters",
      "```",
      chapterText,
      "```",
    );
    const scriptPath = join(folderInfo.dirPath, "script.md");
    await safeWriteFile(scriptPath, scriptMarkdownLines.join("\n"));

    // 9. Write metadata.json
    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "youtube",
      title: plan.title,
      description: plan.description,
      tags: plan.tags,
      actualDuration: currentTimeSec,
      targetDuration: plan.targetDuration,
      sectionCount: plan.sections.length + (rawDemoAppended ? 1 : 0),
      hasRawDemo: rawDemoAppended,
      rawDemoDuration: rawDemoDurationSec,
      chapters,
      srtFile: srtPath,
      scriptFile: scriptPath,
      videoFile: finalMp4Path,
    });

    log.info(
      `YouTube render complete: ${finalMp4Path} (${currentTimeSec}s, v${folderInfo.version})`,
    );

    return {
      success: true,
      outputPath: finalMp4Path,
      srtPath,
      scriptPath,
      metadataPath: folderInfo.metadataPath,
      chapters,
      actualDuration: currentTimeSec,
      version: folderInfo.version,
      hasRawDemo: rawDemoAppended,
    };
  }
}


