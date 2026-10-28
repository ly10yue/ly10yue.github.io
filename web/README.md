# MusounD / INTERVAL 0.12.0 Web Playtest

试玩地址：**https://ly10yue.github.io/musound/**

iPad 用 Safari 打开，推荐横屏；也可通过「分享 → 添加到主屏幕」使用。首次点击「开始演奏」时解锁音频。支持 16:9、4:3、多点触控、Tap / Hold、轨迹位置 / 透明度 / 流速、区域中心 / 旋转 / 长宽、重叠区域并集轮廓。

点击「导入谱面」，在 iPad 的「文件」中选择电脑制谱器导出的 `.interval`（也接受相同 ZIP 结构）。包内必须有根目录 `chart.json` 和它引用的歌曲。支持 Composer 0.11.0 的 v3–v5，以及 0.12.0 的 v6 百分制坐标。纯 `.ivproj` 未包含歌曲，不能直接用于游玩。

导入只在本机解压 / 解析 / 播放，不上传服务器。曲库保存到 IndexedDB；浏览器可能回收存储，需保留原文件。容量不足时仍允许当前会话游玩，并提示未保存。音频按 Blob 保存，避免打开曲库时将全部歌曲解码占用内存。

网页限制：每包 64 MB、最长 10 分钟、单声道 / 双声道，最多 20000 个音符、64 条线、每段 32 个区域。若歌曲与谱面时长相差超过 2 秒则拒绝开始，避免错配。不同设备声音输出延迟可用设置补偿；蓝牙输出可能有较大延迟。

Native Web Audio 解码失败时自动使用随站点部署的 WebAssembly Vorbis 解码器，兼容不原生支持 Ogg 的 iPad Safari。歌曲和打击音共用 AudioContext，双押用独立 BufferSource 同时播放。时钟直接来自音频上下文；暂停会取消已调度音效，继续有 3 秒倒数，可提前重新接住 Hold。切后台 / 声音中断 / 旋转自动暂停。

首次完整加载后 Service Worker 缓存应用与内置歌曲，可离线使用；导入谱面保存在本机。缓存范围仅 `/musound/`，不接管个人网站其他项目。localhost 开发默认不注册 SW，避免旧缓存干扰迭代。

## 开发与测试

无前端构建步骤，全部静态文件；引擎使用独立 ES 模块。判定窗口、Hold 宽限、积分流速和几何计算对应 Android 0.12.0。

在工程根目录运行：

```powershell
python tools/serve_web.py --port 8766
node --test web/tests/engine.test.mjs
npm install --prefix build/web-deps --no-audit --no-fund @playwright/test@1.64.1
node build/web-deps/node_modules/playwright/cli.js install webkit
node web/tests/browser.cjs chromium
node web/tests/browser.cjs webkit
```

Chromium 测试使用已安装的 Microsoft Edge 独立临时浏览器配置；WebKit 测试使用 Playwright 自带浏览器。浏览器集成测试的真实导出包来自 `dist/0.12.0/Desultory-Signals-AT-Flow.interval`。测试结果在 `build/web-tests/`，最终验证记录在主工程 `docs/web-0.12.0.md`。没有实体 iPad 时，不将桌面 WebKit 测试声称为真机验证。

## 部署

完整源代码保存在游戏仓库 `web/`。部署时把运行文件、assets/、vendor/ 拷贝到 `ly10yue.github.io` 仓库的 `musound/`，不发布测试代码与依赖目录；保持个人主页原有项目入口，再追加试玩链接。GitHub Pages 从 main 分支根目录构建。

修订静态资源时更新 `sw.js` 缓存标识；不强制替换正在游玩的页面，关闭所有试玩页再打开即可激活待更新版本。

第三方许可见 [THIRD_PARTY.md](THIRD_PARTY.md)。
