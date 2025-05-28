This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
.github/
  workflows/
    deploy.yml
    nextjs.yml
prompts/
  images.txt
  new_cover.txt
public/
  images/
    tools/
      mosfet/
        File_Enh_N_channel_Mosfet.svg
        File_Enh_P_channel_Mosfet_2.svg
    site.webmanifest
  .nojekyll
  blog-data.json
  CNAME
  file.svg
  globe.svg
  next.svg
  robots.txt
  rss.xml
  vercel.svg
  window.svg
scripts/
  blog-manager.js
  create-blog-post.js
  deploy-gh-pages.js
  generate-blog-data.js
  generate-command-list.js
  generate-rss.js
  project-manager.js
src/
  app/
    about/
      page.tsx
    api/
      contact/
        route.ts
    blog/
      [slug]/
        page.tsx
      tag/
        [tag]/
          page.tsx
      page.tsx
    contact/
      page.tsx
    projects/
      [slug]/
        page.tsx
      page.tsx
    tools/
      mosfet-calculator/
        page.tsx
      ohms-law-calculator/
        page.tsx
      wiremapper/
        components/
          Connector.tsx
          ConnectorBuilder.tsx
          ConnectorCanvas.tsx
          ConnectorDetail.tsx
          ConnectorNode.tsx
          ConnectorPreview.tsx
          ConnectorRenderer.tsx
          context-menu.css
          ContextMenu.tsx
          DynamicConfigInput.tsx
          EditConnector.tsx
          index.ts
          MappingList.tsx
          Modal.tsx
          PinDetail.tsx
          PinDisplay.tsx
          PinEditor.tsx
          PrintView.tsx
          ProjectControls.tsx
          TableView.tsx
          WireMapper.tsx
          WiringDiagramPreview.tsx
        connectors/
          base/
            IConnectorRenderer.ts
          CircleRenderer.ts
          connectorRegistry.ts
          RectangleRenderer.ts
        lib/
          index.ts
        store/
          useWireMapperStore.ts
        types/
          index.ts
        utils/
          generateUniqueId.ts
          printUtils.ts
        constants.ts
        page.tsx
        tsconfig.json
        WireMapper_PRD.md
        wiremapper-todo.md
        wiremapper.css
      page.tsx
    globals.css
    layout.tsx
    page.tsx
    sitemap.ts
  components/
    HDMIPinout/
      HDMIPinout.jsx
      HDMIPinout.module.css
    I2CDetectOutput/
      I2CDetectOutput.module.css
      I2CDetectOutput.tsx
      index.ts
    InteractiveCodeBlock/
      index.ts
      InteractiveCodeBlock.module.css
      InteractiveCodeBlock.tsx
      prism-line-numbers.css
    projects/
      ProjectCard.tsx
      ProjectContent.tsx
    radarchart/
      HardwareScoreRadar.tsx
    terminal/
      commands/
        BannerCommand.ts
        ClearCommand.ts
        Command.ts
        ExitCommand.ts
        FortuneCommand.ts
        HelpCommand.ts
        LsCommand.ts
        PowerCommand.ts
        SudoCommand.ts
      CommandRegistry.ts
    tools/
      MosfetCalculator/
        Description.tsx
        index.tsx
        mosfetData.json
        MosfetDiagram.tsx
        MosfetTypeSelector.tsx
        mosfetUtils.test.ts
        mosfetUtils.ts
        NChannelMosfetConfiguration.tsx
        PChannelMosfetConfiguration.tsx
        styles.css
      OhmsLawCalculator/
        Description.tsx
        index.tsx
        OhmsLawDiagram.tsx
        OhmsLawForm.tsx
        ohmsLawUtils.ts
        styles.css
    TooltipText/
      index.ts
      TooltipText.module.css
      TooltipText.tsx
    BlogCard.tsx
    BlogPost.tsx
    ClientQuakeTerminalWrapper.tsx
    CodeBlock.tsx
    ContactForm.tsx
    DropCap.tsx
    Footer.tsx
    ImageWidget.tsx
    Navigation.tsx
    QuakeTerminal.tsx
    RadixTabs.module.css
    RadixTabs.tsx
  content/
    blog/
      custom-protocol-bruh/
        index.mdx
      i2c-hdmi-hacks/
        index.mdx
      introducing-picotag/
        index.mdx
      lora-without-lorawan/
        index.mdx
      whats-hiding-in-my-coffee-maker/
        index.mdx
    projects/
      battle-with-bytes-blog/
        index.mdx
      boats-no-woes/
        index.mdx
      cnc-laser-engraving/
        index.mdx
      custom-automotive-golf-cart/
        index.mdx
      custom-obdii-interface/
        index.mdx
      home-lab-diy-workspace/
        index.mdx
      personal-culinary-exploration/
        index.mdx
      picotag/
        index.mdx
      reverse-engineering-malware-analysis/
        index.mdx
      smart-inventory-management/
        index.mdx
      stm32-embedded-development/
        index.mdx
  lib/
    utils/
      inputUtils.ts
      projects.ts
      seo.ts
      Tooltip.tsx
    blog.ts
  styles/
    dropcap.css
    prism-theme.css
  types/
    react-console-emulator.d.ts
tests/
  blog/
    blog-system.test.js
  lib/
    utils/
      debug-parser.test.ts
      detailed-debug.test.ts
      inputUtils.test.ts
      ohmsLawUtils.test.ts
      parseValueWithSuffix.test.ts
.gitignore
.windsurfrules
eslint.config.mjs
jest-results.json
jest.config.js
mdx-components.tsx
next.config.js
next.config.ts
notes.txt
package.json
postcss.config.mjs
README.md
smtp-config-example.txt
tsconfig.json
vision.md
```

# Files

## File: .github/workflows/deploy.yml
````yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Step 1: Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.10.0"

      # Step 2: Setup pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.6.2
          run_install: false

      # Optional but recommended: Verify pnpm installation
      - name: Verify pnpm installation and get path
        run: |
          which pnpm
          pnpm --version

      # Step 3: Install dependencies
      - name: Enable Corepack
        run: corepack enable

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v4
        name: Setup pnpm cache
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install

      # Downgrade @mdx-js/loader to a compatible version if needed
      - name: Fix MDX loader compatibility
        run: |
          pnpm remove @mdx-js/loader @mdx-js/react
          pnpm add @mdx-js/loader@2.3.0 @mdx-js/react@2.3.0

      # Step 4: Build and Export with environment variables
      - name: Build Next.js site
        run: pnpm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      # Step 5: Upload artifact
      - name: Upload artifact for deployment
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
````

## File: .github/workflows/nextjs.yml
````yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Step 1: Setup Node.js (without pnpm caching specified here)
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.10.0"
          # REMOVED cache: "pnpm" - Let pnpm/action-setup handle pnpm specifics

      # Step 2: Setup pnpm (this installs pnpm and sets up caching)
      - name: Setup pnpm
        uses: pnpm/action-setup@v2 # Consider updating to v3 or v4 if needed
        with:
          version: 8.6.2
          run_install: false # We will run install manually later

      # Optional but recommended: Verify pnpm installation
      - name: Verify pnpm installation and get path
        run: |
          which pnpm
          pnpm --version

      # Step 3: Install dependencies (now pnpm is guaranteed to be available)
      # Enable corepack explicitly for pnpm caching to work reliably with pnpm/action-setup
      - name: Enable Corepack
        run: corepack enable

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v4
        name: Setup pnpm cache
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install

      # Downgrade @mdx-js/loader to a compatible version
      - name: Fix MDX loader compatibility
        run: |
          pnpm remove @mdx-js/loader @mdx-js/react
          pnpm add @mdx-js/loader@2.3.0 @mdx-js/react@2.3.0

      # Step 4: Build and Export with environment variables
      - name: Build Next.js site
        run: pnpm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      # Step 5: Upload artifact
      - name: Upload artifact for deployment
        uses: actions/upload-pages-artifact@v3
        with:
          # Path to the output directory from next build with output: 'export'
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }} # Output the deployment URL
    steps:
      - name: Deploy to GitHub Pages
        id: deployment # Add an ID to reference outputs
        uses: actions/deploy-pages@v4
        # No 'with' section needed, it automatically uses the artifact from the 'build' job
````

## File: prompts/images.txt
````
A 2D digital graphic design featuring a minimal, retro-tech aesthetic. The image should use a dark background with neon accent colors like green (#00ff9d) and blue (#0088ff). The style should feel like a hacker terminal or vintage embedded device manual.

Focus on clean lines, futuristic tech iconography, and embedded systems themes. Include elements like circuit traces, radio waves, microcontrollers, UART interfaces, or LoRa communication symbols.

Text is allowed only for short technical labels or schematic annotations — but do not include the blog title or marketing slogans. Avoid background grids (already handled by CSS).

<<ENTER TITLE HERE>>

Maintain an aspect ratio of 16:9 optimized for blog cover images can we create a prompt that will uses the similar colors for a mermaid.js chart too?
````

## File: prompts/new_cover.txt
````
Create a 3D isometric digital illustration in a clean, modern, retro-tech concept art style.

Visual Style:
- Background: dark matte or subtle tech grid, near black (#0a0d11).
- Primary neon accents:
  - Neon green: #00ff9d
  - Neon blue: #0088ff
- Optional accent lines for signal/data flow:
  - Orange: #ffa500
  - Yellow: #ffff00
  - Purple: #c084fc
- Use soft light bloom and glow effects on lines and edges.
- Clean geometric shapes with sharp neon outlines, thin stroke weight.
- Isometric composition with balanced spacing — diagram clarity > realism.

Design Language:
- Minimalist layout with clear data or component flow.
- Glow-traced cables or wires connecting systems/devices.
- Floating module labels or blocks encouraged (e.g., "Parser", "Decoder", etc.).
- Optional binary pattern or terminal text in background as subtle ambient texture.

Tone:
- Futuristic, embedded/hardware-lab feel
- Clean, structured, and readable like a technical concept map
- Retro-futurism meets modern embedded dev aesthetics

Negative Prompts:
--no 2D flat
--no photorealism
--no clutter
--no unstructured abstract art

Aspect Ratio:
--ar 16:9
````

## File: public/images/tools/mosfet/File_Enh_N_channel_Mosfet.svg
````
<!DOCTYPE html>
<html class="client-nojs skin-theme-clientpref-day mf-expand-sections-clientpref-0 mf-font-size-clientpref-small mw-mf-amc-clientpref-0" lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<title>File:Enh N channel Mosfet.svg - Wikipedia</title>
<script>(function(){var className="client-js skin-theme-clientpref-day mf-expand-sections-clientpref-0 mf-font-size-clientpref-small mw-mf-amc-clientpref-0";var cookie=document.cookie.match(/(?:^|; )enwikimwclientpreferences=([^;]+)/);if(cookie){cookie[1].split('%2C').forEach(function(pref){className=className.replace(new RegExp('(^| )'+pref.replace(/-clientpref-\w+$|[^\w-]+/g,'')+'-clientpref-\\w+( |$)'),'$1'+pref+'$2');});}document.documentElement.className=className;}());RLCONF={"wgBreakFrames":false,"wgSeparatorTransformTable":["",""],"wgDigitTransformTable":["",""],"wgDefaultDateFormat":"dmy","wgMonthNames":["","January","February","March","April","May","June","July","August","September","October","November","December"],"wgRequestId":"46d23e98-85d1-4f35-b9f3-6d634af34f0a","wgCanonicalNamespace":"File","wgCanonicalSpecialPageName":false,"wgNamespaceNumber":6,"wgPageName":"File:Enh_N_channel_Mosfet.svg","wgTitle":"Enh N channel Mosfet.svg","wgCurRevisionId":0,"wgRevisionId":0,"wgArticleId":0,"wgIsArticle":true,"wgIsRedirect":false,"wgAction":"view","wgUserName":null,"wgUserGroups":["*"],"wgPageViewLanguage":"en","wgPageContentLanguage":"en","wgPageContentModel":"wikitext","wgRelevantPageName":"File:Enh_N_channel_Mosfet.svg","wgRelevantArticleId":0,"wgIsProbablyEditable":false,"wgRelevantPageIsProbablyEditable":false,"wgRestrictionCreate":[],"wgNoticeProject":"wikipedia","wgCiteReferencePreviewsActive":false,"wgFlaggedRevsParams":{"tags":{"status":{"levels":1}}},"wgMediaViewerOnClick":true,"wgMediaViewerEnabledByDefault":true,"wgPopupsFlags":0,"wgVisualEditor":{"pageLanguageCode":"en","pageLanguageDir":"ltr","pageVariantFallbacks":"en"},"wgMFMode":"stable","wgMFAmc":false,"wgMFAmcOutreachActive":false,"wgMFAmcOutreachUserEligible":false,"wgMFLazyLoadImages":true,"wgMFEditNoticesFeatureConflict":false,"wgMFDisplayWikibaseDescriptions":{"search":true,"watchlist":true,"tagline":false,"nearby":true},"wgMFIsSupportedEditRequest":true,"wgMFScriptPath":"","wgWMESchemaEditAttemptStepOversample":false,"wgWMEPageLength":0,"wgEditSubmitButtonLabelPublish":true,"wgSectionTranslationTargetLanguages":["ab","ace","ady","af","alt","am","ami","an","ang","ann","anp","ar","arc","ary","arz","as","ast","atj","av","avk","awa","ay","az","azb","ba","ban","bar","bbc","bcl","bdr","be","be-tarask","bew","bg","bho","bi","bjn","blk","bm","bn","bo","bpy","br","bs","btm","bug","bxr","ca","cbk-zam","cdo","ce","ceb","ch","chr","chy","ckb","co","cr","crh","cs","csb","cu","cv","cy","da","dag","de","dga","din","diq","dsb","dtp","dty","dv","dz","ee","el","eml","en","eo","es","et","eu","ext","fa","fat","ff","fi","fj","fo","fon","fr","frp","frr","fur","fy","ga","gag","gan","gcr","gd","gl","glk","gn","gom","gor","got","gpe","gsw","gu","guc","gur","guw","gv","ha","hak","haw","he","hi","hif","hr","hsb","ht","hu","hy","hyw","ia","iba","id","ie","ig","igl","ik","ilo","inh","io","is","it","iu","ja","jam","jbo","jv","ka","kaa","kab","kbd","kbp","kcg","kg","kge","ki","kk","kl","km","kn","knc","ko","koi","krc","ks","ksh","ku","kus","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","lld","lmo","ln","lo","lt","ltg","lv","lzh","mad","mai","map-bms","mdf","mg","mhr","mi","min","mk","ml","mn","mni","mnw","mos","mr","mrj","ms","mt","mwl","my","myv","mzn","nah","nan","nap","nb","nds","nds-nl","ne","new","nia","nl","nn","nov","nqo","nr","nrm","nso","nv","ny","oc","olo","om","or","os","pa","pag","pam","pap","pcd","pcm","pdc","pfl","pi","pih","pl","pms","pnb","pnt","ps","pt","pwn","qu","rm","rmy","rn","ro","roa-tara","rsk","ru","rue","rup","rw","sa","sah","sat","sc","scn","sco","sd","se","sg","sgs","sh","shi","shn","si","simple","sk","skr","sl","sm","smn","sn","so","sq","sr","srn","ss","st","stq","su","sv","sw","syl","szl","szy","ta","tay","tcy","tdd","te","tet","tg","th","ti","tig","tk","tl","tly","tn","to","tpi","tr","trv","ts","tt","tum","tw","ty","tyv","udm","ug","uk","ur","uz","ve","vec","vep","vi","vls","vo","vro","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zgh","zh","zu"],"isLanguageSearcherCXEntrypointEnabled":false,"mintEntrypointLanguages":["tn","vec","ast","lmo"],"wgCheckUserClientHintsHeadersJsApi":["brands","architecture","bitness","fullVersionList","mobile","model","platform","platformVersion"],"GEHomepageSuggestedEditsEnableTopics":true,"wgGETopicsMatchModeEnabled":false,"wgGELevelingUpEnabledForUser":false,"wgMinervaPermissions":{"watchable":true,"watch":false},"wgMinervaFeatures":{"beta":false,"donateBanner":true,"donate":false,"mobileOptionsLink":true,"categories":false,"pageIssues":true,"talkAtTop":true,"historyInPageActions":false,"overflowSubmenu":false,"tabsOnSpecials":true,"personalMenu":false,"mainMenuExpanded":false,"echo":true,"nightMode":true},"wgMinervaDownloadNamespaces":[0]};
RLSTATE={"ext.globalCssJs.user.styles":"ready","site.styles":"ready","user.styles":"ready","ext.globalCssJs.user":"ready","user":"ready","user.options":"loading","mediawiki.interface.helpers.styles":"ready","mediawiki.action.view.filepage":"ready","skins.minerva.styles":"ready","skins.minerva.content.styles.images":"ready","mediawiki.hlist":"ready","skins.minerva.codex.styles":"ready","skins.minerva.icons":"ready","filepage":"ready","skins.minerva.amc.styles":"ready","ext.wikimediamessages.styles":"ready","mobile.init.styles":"ready"};RLPAGEMODULES=["mediawiki.interface.helpers","mediawiki.action.view.metadata","site","mediawiki.page.ready","skins.minerva.scripts","ext.centralNotice.geoIP","ext.centralNotice.startUp","ext.gadget.switcher","ext.urlShortener.toolbar","ext.centralauth.centralautologin","ext.popups","mobile.init","ext.echo.centralauth","ext.eventLogging","ext.wikimediaEvents","ext.navigationTiming","ext.cx.eventlogging.campaigns","ext.cx.entrypoints.languagesearcher.init","mw.externalguidance.init","ext.checkUser.clientHints"];</script>
<script>(RLQ=window.RLQ||[]).push(function(){mw.loader.impl(function(){return["user.options@12s5i",function($,jQuery,require,module){mw.user.tokens.set({"patrolToken":"+\\","watchToken":"+\\","csrfToken":"+\\"});
}];});});</script>
<link rel="stylesheet" href="/w/load.php?lang=en&amp;modules=ext.wikimediamessages.styles%7Cfilepage%7Cmediawiki.action.view.filepage%7Cmediawiki.hlist%7Cmediawiki.interface.helpers.styles%7Cmobile.init.styles%7Cskins.minerva.amc.styles%7Cskins.minerva.codex.styles%7Cskins.minerva.content.styles.images%7Cskins.minerva.icons%2Cstyles&amp;only=styles&amp;skin=minerva">
<script async="" src="/w/load.php?lang=en&amp;modules=startup&amp;only=scripts&amp;raw=1&amp;skin=minerva"></script>
<link rel="stylesheet" href="https://commons.wikimedia.org/w/index.php?title=MediaWiki:Filepage.css&amp;action=raw&amp;ctype=text/css">
<meta name="ResourceLoaderDynamicStyles" content="">
<link rel="stylesheet" href="/w/load.php?lang=en&amp;modules=site.styles&amp;only=styles&amp;skin=minerva">
<meta name="generator" content="MediaWiki 1.44.0-wmf.24">
<meta name="referrer" content="origin">
<meta name="referrer" content="origin-when-cross-origin">
<meta name="robots" content="max-image-preview:standard">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#eaecf0">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/1200px-Enh_N_channel_Mosfet.svg.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1371">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/800px-Enh_N_channel_Mosfet.svg.png">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="914">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/640px-Enh_N_channel_Mosfet.svg.png">
<meta property="og:image:width" content="640">
<meta property="og:image:height" content="731">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0">
<meta property="og:title" content="File:Enh N channel Mosfet.svg - Wikipedia">
<meta property="og:type" content="website">
<link rel="preconnect" href="//upload.wikimedia.org">
<link rel="preconnect" href="//upload.wikimedia.org">
<link rel="manifest" href="/w/api.php?action=webapp-manifest">
<link rel="apple-touch-icon" href="/static/apple-touch/wikipedia.png">
<link rel="icon" href="/static/favicon/wikipedia.ico">
<link rel="search" type="application/opensearchdescription+xml" href="/w/rest.php/v1/search" title="Wikipedia (en)">
<link rel="EditURI" type="application/rsd+xml" href="//en.wikipedia.org/w/api.php?action=rsd">
<link rel="canonical" href="https://commons.wikimedia.org/wiki/File:Enh_N_channel_Mosfet.svg">
<link rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/deed.en">
<link rel="dns-prefetch" href="//meta.wikimedia.org" />
<link rel="dns-prefetch" href="auth.wikimedia.org">
</head>
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-6 ns-subject page-File_Enh_N_channel_Mosfet_svg rootpage-File_Enh_N_channel_Mosfet_svg stable skin-minerva action-view skin--responsive mw-mf-amc-disabled mw-mf"><div id="mw-mf-viewport">
	<div id="mw-mf-page-center">
		<a class="mw-mf-page-center__mask" href="#"></a>
		<header class="header-container header-chrome">
			<div class="minerva-header">
				<nav class="navigation-drawer toggle-list view-border-box">
					<input type="checkbox" id="main-menu-input"
						data-event-name="ui.mainmenu"
						class="toggle-list__checkbox" role="button" aria-haspopup="true" aria-expanded="false" aria-labelledby="mw-mf-main-menu-button">
					<label for="main-menu-input" id="mw-mf-main-menu-button" aria-hidden="true" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet toggle-list__toggle">
    <span class="minerva-icon minerva-icon--menu"></span>
<span></span>
</label>

					<div id="mw-mf-page-left" class="menu view-border-box">
	<ul id="p-navigation" class="toggle-list__list">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--home" href="/wiki/Main_Page" data-mw="interface">
					<span class="minerva-icon minerva-icon--home"></span>

					<span class="toggle-list-item__label">Home</span>
				</a>
			</li>
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--random" href="/wiki/Special:Random" data-mw="interface">
					<span class="minerva-icon minerva-icon--die"></span>

					<span class="toggle-list-item__label">Random</span>
				</a>
			</li>
			<li class="toggle-list-item skin-minerva-list-item-jsonly">
				<a class="toggle-list-item__anchor menu__item--nearby" href="/wiki/Special:Nearby" data-event-name="menu.nearby" data-mw="interface">
					<span class="minerva-icon minerva-icon--mapPin"></span>

					<span class="toggle-list-item__label">Nearby</span>
				</a>
			</li>
	</ul>
	<ul id="p-personal" class="toggle-list__list">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor mw-list-item menu__item--login" href="/w/index.php?title=Special:UserLogin&amp;returnto=File%3AEnh+N+channel+Mosfet.svg" data-event-name="menu.login" data-mw="interface">
					<span class="minerva-icon minerva-icon--logIn"></span>

					<span class="toggle-list-item__label">Log in</span>
				</a>
			</li>
	</ul>
	<ul id="pt-preferences" class="toggle-list__list">
			<li class="toggle-list-item skin-minerva-list-item-jsonly">
				<a class="toggle-list-item__anchor menu__item--settings" href="/w/index.php?title=Special:MobileOptions&amp;returnto=File%3AEnh+N+channel+Mosfet.svg" data-event-name="menu.settings" data-mw="interface">
					<span class="minerva-icon minerva-icon--settings"></span>

					<span class="toggle-list-item__label">Settings</span>
				</a>
			</li>
	</ul>
			<div class="donate-banner">
				<a href="https://donate.wikimedia.org/?wmf_source=donate&amp;wmf_medium=sidebar&amp;wmf_campaign=en.wikipedia.org&amp;uselang=en" class="donate-banner__link"
					data-event-name="menu.donateBanner">
					<div class="donate-banner__text-container">
						<span class="donate-banner__text">Donate Now</span>
						<span class="donate-banner__subtitle">If Wikipedia is useful to you, please give today.</span>
					</div>
					<picture>
						<source
			    			srcset="https://en.wikipedia.org/static/images/donate/donate.png"
			   				media="(prefers-reduced-motion)" />
						<img src="https://en.wikipedia.org/static/images/donate/donate.gif" alt="" class="donate-banner__gif" loading="lazy">
					</picture>
				</a>
			</div>
	<ul class="hlist">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--about" href="/wiki/Wikipedia:About" data-mw="interface">
					
					<span class="toggle-list-item__label">About Wikipedia</span>
				</a>
			</li>
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--disclaimers" href="/wiki/Wikipedia:General_disclaimer" data-mw="interface">
					
					<span class="toggle-list-item__label">Disclaimers</span>
				</a>
			</li>
	</ul>
</div>

					<label class="main-menu-mask" for="main-menu-input"></label>
				</nav>
				<div class="branding-box">
					<a href="/wiki/Main_Page">
						<span><img src="/static/images/mobile/copyright/wikipedia-wordmark-en.svg" alt="Wikipedia" width="120" height="18"
	style="width: 7.5em; height: 1.125em;"/>

</span>
						
					</a>
				</div>
					<form action="/w/index.php" method="get" class="minerva-search-form">
				<div class="search-box">
					<input type="hidden" name="title" value="Special:Search"/>
					<input class="search skin-minerva-search-trigger" id="searchInput"
						 type="search" name="search" placeholder="Search Wikipedia" aria-label="Search Wikipedia" autocapitalize="sentences" title="Search Wikipedia [f]" accesskey="f">
					<span class="search-box-icon-overlay"><span class="minerva-icon minerva-icon--search"></span>
</span>
				</div>
				<button id="searchIcon" class="cdx-button cdx-button--size-large cdx-button--icon-only cdx-button--weight-quiet skin-minerva-search-trigger">
	    <span class="minerva-icon minerva-icon--search"></span>
<span>Search</span>
	</button>
</form>
		<nav class="minerva-user-navigation" aria-label="User navigation">
					
				</nav>
			</div>
		</header>
		<main id="content" class="mw-body">
			<div class="banner-container">
			<div id="siteNotice"></div>
			</div>
			
			<div class="pre-content heading-holder">
				<div class="page-heading">
					<h1 id="firstHeading" class="firstHeading mw-first-heading">File:Enh N channel Mosfet.svg</h1>
					<div class="tagline"></div>
				</div>
					<ul id="p-associated-pages" class="minerva__tab-container">
							<li class="minerva__tab selected mw-list-item">
								<a class="minerva__tab-text" href="/wiki/File:Enh_N_channel_Mosfet.svg" rel="" data-event-name="tabs.image">File</a>
							</li>
							<li class="minerva__tab new mw-list-item">
								<a class="minerva__tab-text" href="/w/index.php?title=File_talk:Enh_N_channel_Mosfet.svg&amp;action=edit&amp;redlink=1" rel="discussion" data-event-name="tabs.image_talk">Talk</a>
							</li>
					</ul>
				<nav class="page-actions-menu">
	<ul id="p-views" class="page-actions-menu__list minerva-icon-only-menu">
		<li id="language-selector" class="page-actions-menu__list-item">
				<a role="button" href="" data-mw="interface" data-event-name="menu.languages" title="Language" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet language-selector disabled">
				    <span class="minerva-icon minerva-icon--language"></span>
<span>Language</span>
				</a>
		</li>
		<li id="page-actions-watch" class="page-actions-menu__list-item">
				<a role="button" id="ca-watch" href="/w/index.php?title=Special:UserLogin&amp;returnto=File%3AEnh+N+channel+Mosfet.svg" data-event-name="menu.watch" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet menu__item--page-actions-watch">
				    <span class="minerva-icon minerva-icon--star"></span>
<span>Watch</span>
				</a>
		</li>
	</ul>
</nav>
<!-- version 1.0.2 (change every time you update a partial) -->
				<div id="mw-content-subtitle"></div>
			</div>
			<div id="bodyContent" class="content">
				<div id="mw-content-text" class="mw-body-content"><script>function mfTempOpenSection(id){var block=document.getElementById("mf-section-"+id);block.className+=" open-block";block.previousSibling.className+=" open-block";}</script><ul id="filetoc" role="navigation"><li><a href="#file">File</a></li>
<li><a href="#filehistory">File history</a></li>
<li><a href="#filelinks">File usage</a></li>
<li><a href="#globalusage">Global file usage</a></li>
<li><a href="#metadata">Metadata</a></li></ul><div class="fullImageLink" id="file"><a href="//upload.wikimedia.org/wikipedia/commons/f/f8/Enh_N_channel_Mosfet.svg"><img alt="File:Enh N channel Mosfet.svg" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/35px-Enh_N_channel_Mosfet.svg.png" decoding="async" width="35" height="40" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/52px-Enh_N_channel_Mosfet.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/70px-Enh_N_channel_Mosfet.svg.png 2x" data-file-width="35" data-file-height="40" /></a><div class="mw-filepage-resolutioninfo">Size of this PNG preview of this SVG file: <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/35px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">35 × 40 pixels</a>. <span class="mw-filepage-other-resolutions">Other resolutions: <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/210px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">210 × 240 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/420px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">420 × 480 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/672px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">672 × 768 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/896px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">896 × 1,024 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/1792px-Enh_N_channel_Mosfet.svg.png" class="mw-thumbnail-link">1,792 × 2,048 pixels</a>.</span></div></div>
<div class="mw-content-ltr fullMedia" lang="en" dir="ltr"><p><bdi dir="ltr"><a href="//upload.wikimedia.org/wikipedia/commons/f/f8/Enh_N_channel_Mosfet.svg" class="internal" title="Enh N channel Mosfet.svg">Original file</a></bdi> <span class="fileInfo">(SVG file, nominally 35 × 40 pixels, file size: 10 KB)</span>
</p></div><div class="sharedUploadNotice">
<div class="mw-parser-output">
<style data-mw-deduplicate="TemplateStyles:r1238441935">.mw-parser-output .fmbox{clear:both;margin:0.2em 0;width:100%;border:1px solid #a2a9b1;background-color:var(--background-color-interactive-subtle,#f8f9fa);box-sizing:border-box;color:var(--color-base,#202122)}.mw-parser-output .fmbox-warning{border:1px solid #bb7070;background-color:#ffdbdb}.mw-parser-output .fmbox-editnotice{background-color:transparent}.mw-parser-output .fmbox .mbox-text{border:none;padding:0.25em 0.9em;width:100%}.mw-parser-output .fmbox .mbox-image{border:none;padding:2px 0 2px 0.9em;text-align:center}.mw-parser-output .fmbox .mbox-imageright{border:none;padding:2px 0.9em 2px 0;text-align:center}.mw-parser-output .fmbox .mbox-invalid-type{text-align:center}@media screen{html.skin-theme-clientpref-night .mw-parser-output .fmbox-warning{background-color:#300}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .fmbox-warning{background-color:#300}}</style><table id="mw-sharedupload" class="plainlinks fmbox fmbox-system" role="presentation"><tbody><tr><td class="mbox-image"><span class="noviewer" typeof="mw:File"><span title="Wikimedia Commons logo"><img alt="" src="//upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/40px-Commons-logo.svg.png" decoding="async" width="30" height="40" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/60px-Commons-logo.svg.png 1.5x" data-file-width="1024" data-file-height="1376" /></span></span></td><td class="mbox-text" style="text-align: center;">This is a file from the <a href="https://commons.wikimedia.org/wiki/Main_Page" class="extiw" title="commons:Main Page">Wikimedia Commons</a>. Information from its <b><a href="https://commons.wikimedia.org/wiki/File:Enh_N_channel_Mosfet.svg" class="extiw" title="commons:File:Enh N channel Mosfet.svg">description page there</a></b> is shown below.<br /><span style="font-size: smaller;">Commons is a freely licensed media file repository. <a href="https://commons.wikimedia.org/wiki/Commons:Welcome" class="extiw" title="commons:Commons:Welcome">You can help</a>.</span></td></tr></tbody></table>
</div>
</div>
<div id="shared-image-desc"><div class="mw-content-ltr mw-parser-output" lang="en" dir="ltr"><div class="mw-heading mw-heading2"><h2 id="Summary">Summary</h2></div>
<div class="hproduct commons-file-information-table">
<table class="fileinfotpl-type-information vevent" dir="ltr">

<tbody><tr>
<td id="fileinfotpl_desc" class="fileinfo-paramfield" lang="en">Description<span class="summary fn" style="display:none">Enh N channel Mosfet.svg</span></td>
<td class="description">
<div class="description en" dir="ltr" lang="en"><span class="language en" title="English"><b>English: </b></span> Enhancement, N-channel MOSFET</div></td>
</tr>

<tr>
<td id="fileinfotpl_date" class="fileinfo-paramfield" lang="en">Date</td>
<td lang="en">
<time class="dtstart" datetime="2016-07-20" lang="en" dir="ltr" style="white-space:nowrap">20 July 2016</time></td>
</tr>

<tr>
<td id="fileinfotpl_src" class="fileinfo-paramfield" lang="en">Source</td>
<td>
<span class="int-own-work" lang="en">Own work</span></td>
</tr>

<tr>
<td id="fileinfotpl_aut" class="fileinfo-paramfield" lang="en">Author</td>
<td>
<a href="//commons.wikimedia.org/w/index.php?title=User:ErikBuer&amp;action=edit&amp;redlink=1" class="new" title="User:ErikBuer (page does not exist)">ErikBuer</a></td>
</tr>


</tbody></table>
</div>
<div class="mw-heading mw-heading2"><h2 id="Licensing">Licensing</h2></div>
<div style="clear:both; margin:0.5em auto; background-color:var(--background-color-interactive,#eaecf0); color:inherit; border:2px solid var(--border-color-subtle,#c8ccd1); padding:8px; direction:ltr;" class="licensetpl_wrapper"><div class="center" style="font-weight:bold;"><div lang="en" dir="ltr" class="description en" style="display:inline;">I, the copyright holder of this work, hereby publish it under the following license:</div></div>
<div class="responsive-license-cc layouttemplate licensetpl" dir="ltr" lang="en"><div class="rlicense-icons"><span class="skin-invert" typeof="mw:File"><span title="w:en:Creative Commons"><img alt="w:en:Creative Commons" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CC_some_rights_reserved.svg/90px-CC_some_rights_reserved.svg.png" decoding="async" width="90" height="36" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CC_some_rights_reserved.svg/135px-CC_some_rights_reserved.svg.png 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CC_some_rights_reserved.svg/180px-CC_some_rights_reserved.svg.png 2x" data-file-width="744" data-file-height="300"></span></span><br>
<span class="skin-invert" typeof="mw:File"><span title="attribution"><img alt="attribution" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cc-by_new_white.svg/24px-Cc-by_new_white.svg.png" decoding="async" width="24" height="24" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cc-by_new_white.svg/36px-Cc-by_new_white.svg.png 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cc-by_new_white.svg/48px-Cc-by_new_white.svg.png 2x" data-file-width="64" data-file-height="64"></span></span> <span class="skin-invert" typeof="mw:File"><span title="share alike"><img alt="share alike" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Cc-sa_white.svg/40px-Cc-sa_white.svg.png" decoding="async" width="24" height="24" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Cc-sa_white.svg/60px-Cc-sa_white.svg.png 2x" data-file-width="64" data-file-height="64"></span></span></div><div class="rlicense-text"><div class="rlicense-declaration">This file is licensed under the <a href="https://en.wikipedia.org/wiki/en:Creative_Commons" class="extiw" title="w:en:Creative Commons">Creative Commons</a> <a href="//creativecommons.org/licenses/by-sa/4.0/deed.en" class="extiw" title="creativecommons:by-sa/4.0/deed.en">Attribution-Share Alike 4.0 International</a> license.</div><div class="rlicense-desc" style="text-align:start;" lang="en">
<dl><dd>You are free:
<ul><li><b>to share</b> – to copy, distribute and transmit the work</li>
<li><b>to remix</b> – to adapt the work</li></ul></dd>
<dd>Under the following conditions:
<ul><li><b>attribution</b> – You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.</li>
<li><b>share alike</b> – If you remix, transform, or build upon the material, you must distribute your contributions under the <a href="https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses" class="extiw" title="ccorg:share-your-work/licensing-considerations/compatible-licenses">same or compatible license</a> as the original.</li></ul></dd></dl></div><span class="licensetpl_link" style="display:none;">https://creativecommons.org/licenses/by-sa/4.0</span><span class="licensetpl_short" style="display:none;">CC BY-SA 4.0 </span><span class="licensetpl_long" style="display:none;">Creative Commons Attribution-Share Alike 4.0 </span><span class="licensetpl_link_req" style="display:none;">true</span><span class="licensetpl_attr_req" style="display:none;">true</span></div></div></div><h1 class="mw-slot-header"><mediainfoslotheader></mediainfoslotheader></h1><mediainfoview style="display: none"><mediainfoviewcaptions><div class="wbmi-entityview-captionsPanel oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><h3 class="wbmi-entityview-captions-header">Captions</h3><div class="wbmi-entityview-caption oo-ui-layout oo-ui-horizontalLayout"><label class="wbmi-language-label oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement-label oo-ui-labelElement oo-ui-labelWidget">English</label><div lang="en" dir="ltr" class="wbmi-caption-value wbmi-entityview-emptyCaption">Add a one-line explanation of what this file represents</div></div></div></mediainfoviewcaptions><mediainfoviewstatements><div id="P180" data-mw-property="P180" data-mw-statements="[]" data-mw-formatvalue="[]" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P180 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h3 class="wbmi-statements-title">Items portrayed in this file</h3><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P180" href="https://www.wikidata.org/wiki/Special:EntityPage/P180">depicts</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"></div></div></div><div id="P170" data-mw-property="P170" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;somevalue&quot;,&quot;property&quot;:&quot;P170&quot;,&quot;hash&quot;:&quot;d3550e860f988c6675fff913440993f58f5c40c5&quot;},&quot;type&quot;:&quot;statement&quot;,&quot;qualifiers&quot;:{&quot;P4174&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P4174&quot;,&quot;hash&quot;:&quot;e2458a265a60816013f9382211a03ce6b8212e04&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}],&quot;P2093&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P2093&quot;,&quot;hash&quot;:&quot;88912ddf9556401875635071513421afa9ff503a&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}],&quot;P2699&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P2699&quot;,&quot;hash&quot;:&quot;65f99397bb0ae438d3e967a65af3b6885fd1279f&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}]},&quot;qualifiers-order&quot;:[&quot;P4174&quot;,&quot;P2093&quot;,&quot;P2699&quot;],&quot;id&quot;:&quot;M50258318$DFF01112-1026-445B-AFEB-11F7674631A6&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:170,\&quot;id\&quot;:\&quot;P170\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P170\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P170\&quot;>creator<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;creator&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:4174,\&quot;id\&quot;:\&quot;P4174\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P4174\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P4174\&quot;>Wikimedia username<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;Wikimedia username&quot;}}},&quot;{\&quot;value\&quot;:\&quot;ErikBuer\&quot;,\&quot;type\&quot;:\&quot;string\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P4174&quot;:&quot;<a target=\&quot;_blank\&quot; class=\&quot;wb-external-id external\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:CentralAuth?target=ErikBuer\&quot; rel=\&quot;nofollow\&quot;>ErikBuer<\/a>&quot;,&quot;P2093&quot;:&quot;ErikBuer&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P4174&quot;:&quot;ErikBuer&quot;,&quot;P2093&quot;:&quot;ErikBuer&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:2093,\&quot;id\&quot;:\&quot;P2093\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P2093\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P2093\&quot;>author name string<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;author name string&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:2699,\&quot;id\&quot;:\&quot;P2699\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P2699\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P2699\&quot;>URL<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;URL&quot;}}},&quot;{\&quot;value\&quot;:\&quot;https:\\\/\\\/commons.wikimedia.org\\\/wiki\\\/user:ErikBuer\&quot;,\&quot;type\&quot;:\&quot;string\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P2699&quot;:&quot;<a target=\&quot;_blank\&quot; rel=\&quot;nofollow\&quot; class=\&quot;external free\&quot; href=\&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer\&quot;>https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P2699&quot;:&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P170 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P170" href="https://www.wikidata.org/wiki/Special:EntityPage/P170">creator</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi>some value</bdi></h4></div></div></div><div class="wbmi-item-qualifiers"><div class="wbmi-snaklist-container"><div class="wbmi-snaklist-content"><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P4174" href="https://www.wikidata.org/wiki/Special:EntityPage/P4174">Wikimedia username</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value"><a target="_blank" class="wb-external-id external" href="https://www.wikidata.org/wiki/Special:CentralAuth?target=ErikBuer" rel="nofollow">ErikBuer</a></span></div></div><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P2093" href="https://www.wikidata.org/wiki/Special:EntityPage/P2093">author name string</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value">ErikBuer</span></div></div><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P2699" href="https://www.wikidata.org/wiki/Special:EntityPage/P2699">URL</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value"><a target="_blank" rel="nofollow" class="external free" href="https://commons.wikimedia.org/wiki/user:ErikBuer">https://commons.wikimedia.org/wiki/user:ErikBuer</a></span></div></div></div></div></div></div></div></div></div></div><div id="P6216" data-mw-property="P6216" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P6216&quot;,&quot;hash&quot;:&quot;5570347fdc76d2a80732f51ea10ee4b144a084e0&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:50423863,&quot;id&quot;:&quot;Q50423863&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258318$67202E6B-8A5D-4144-B236-4652019370D0&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:6216,\&quot;id\&quot;:\&quot;P6216\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P6216\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P6216\&quot;>copyright status<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;copyright status&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:50423863,\&quot;id\&quot;:\&quot;Q50423863\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P6216&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q50423863\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q50423863\&quot;>copyrighted<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P6216&quot;:&quot;copyrighted&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P6216 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P6216" href="https://www.wikidata.org/wiki/Special:EntityPage/P6216">copyright status</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q50423863" href="https://www.wikidata.org/wiki/Special:EntityPage/Q50423863">copyrighted</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P275" data-mw-property="P275" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P275&quot;,&quot;hash&quot;:&quot;ec6e754c5042e13b53376139e505ebd6708745a4&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:18199165,&quot;id&quot;:&quot;Q18199165&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258318$71C8305C-94DB-4CDE-B65C-104691620758&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:275,\&quot;id\&quot;:\&quot;P275\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P275\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P275\&quot;>copyright license<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;copyright license&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:18199165,\&quot;id\&quot;:\&quot;Q18199165\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P275&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q18199165\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q18199165\&quot;>Creative Commons Attribution-ShareAlike 4.0 International<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P275&quot;:&quot;Creative Commons Attribution-ShareAlike 4.0 International&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P275 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P275" href="https://www.wikidata.org/wiki/Special:EntityPage/P275">copyright license</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q18199165" href="https://www.wikidata.org/wiki/Special:EntityPage/Q18199165">Creative Commons Attribution-ShareAlike 4.0 International</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P7482" data-mw-property="P7482" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P7482&quot;,&quot;hash&quot;:&quot;83568a288a8b8b4714a68e7239d8406833762864&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:66458942,&quot;id&quot;:&quot;Q66458942&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258318$C9A42A5C-34CB-493E-9F2F-A647BA26AA5F&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:7482,\&quot;id\&quot;:\&quot;P7482\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P7482\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P7482\&quot;>source of file<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;source of file&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:66458942,\&quot;id\&quot;:\&quot;Q66458942\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P7482&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q66458942\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q66458942\&quot;>original creation by uploader<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P7482&quot;:&quot;original creation by uploader&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P7482 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P7482" href="https://www.wikidata.org/wiki/Special:EntityPage/P7482">source of file</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q66458942" href="https://www.wikidata.org/wiki/Special:EntityPage/Q66458942">original creation by uploader</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P571" data-mw-property="P571" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P571&quot;,&quot;hash&quot;:&quot;97ce75906af4a033c60295f345b0354c12832090&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;time&quot;:&quot;+2016-07-20T00:00:00Z&quot;,&quot;timezone&quot;:0,&quot;before&quot;:0,&quot;after&quot;:0,&quot;precision&quot;:11,&quot;calendarmodel&quot;:&quot;http:\/\/www.wikidata.org\/entity\/Q1985727&quot;},&quot;type&quot;:&quot;time&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258318$7EBD2EAF-7744-4A09-A634-9AB5175EE8AC&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:571,\&quot;id\&quot;:\&quot;P571\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P571\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P571\&quot;>inception<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;inception&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;time\&quot;:\&quot;+2016-07-20T00:00:00Z\&quot;,\&quot;timezone\&quot;:0,\&quot;before\&quot;:0,\&quot;after\&quot;:0,\&quot;precision\&quot;:11,\&quot;calendarmodel\&quot;:\&quot;http:\\\/\\\/www.wikidata.org\\\/entity\\\/Q1985727\&quot;},\&quot;type\&quot;:\&quot;time\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P571&quot;:&quot;20 July 2016&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P571&quot;:&quot;20 July 2016&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P571 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P571" href="https://www.wikidata.org/wiki/Special:EntityPage/P571">inception</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi>20 July 2016</bdi></h4></div></div></div></div></div></div></div></div></mediainfoviewstatements></mediainfoview>
<!-- 
NewPP limit report
Parsed by mw‐web.codfw.main‐554c98fbf9‐59ld6
Cached time: 20250318075007
Cache expiry: 2592000
Reduced expiry: false
Complications: []
CPU time usage: 0.050 seconds
Real time usage: 0.609 seconds
Preprocessor visited node count: 204/1000000
Post‐expand include size: 9724/2097152 bytes
Template argument size: 44/2097152 bytes
Highest expansion depth: 7/100
Expensive parser function count: 1/500
Unstrip recursion depth: 0/20
Unstrip post‐expand size: 8/5000000 bytes
Lua time usage: 0.023/10.000 seconds
Lua memory usage: 970544/52428800 bytes
Number of Wikibase entities loaded: 1/400
-->
<!--
Transclusion expansion time report (%,ms,calls,template)
100.00%  592.411      1 -total
 67.07%  397.313      1 Template:Self
 32.90%  194.887      1 Template:Information
  1.44%    8.502      1 Template:Cc-by-sa-layout
  0.71%    4.178      1 Template:En
  0.25%    1.461      1 Template:Own
  0.23%    1.374      1 Template:License_template_tag
-->

<!-- Saved in parser cache with key commonswiki:pcache:50258318:|#|:idhash:wb=3!wbMobile=0 and timestamp 20250318075007 and revision id 464093000. Rendering was triggered because: page-view
 -->
</div></div>
<h2 id="filehistory">File history</h2>
<div id="mw-imagepage-section-filehistory">
<p>Click on a date/time to view the file as it appeared at that time.
</p>
<table class="wikitable filehistory">
<tr><th></th><th>Date/Time</th><th>Thumbnail</th><th>Dimensions</th><th>User</th><th>Comment</th></tr>
<tr><td>current</td><td class="filehistory-selected" style="white-space: nowrap;"><a href="//upload.wikimedia.org/wikipedia/commons/f/f8/Enh_N_channel_Mosfet.svg">14:48, 20 July 2016</a></td><td><a href="//upload.wikimedia.org/wikipedia/commons/f/f8/Enh_N_channel_Mosfet.svg"><img alt="Thumbnail for version as of 14:48, 20 July 2016" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Enh_N_channel_Mosfet.svg/105px-Enh_N_channel_Mosfet.svg.png" decoding="async" loading="lazy" width="105" height="120" data-file-width="35" data-file-height="40" /></a></td><td>35 × 40 <span style="white-space: nowrap;">(10 KB)</span></td><td><a href="/w/index.php?title=User:ErikBuer&amp;action=edit&amp;redlink=1" class="new mw-userlink" title="User:ErikBuer (page does not exist)"><bdi>ErikBuer</bdi></a></td><td dir="ltr">Cross-wiki upload from en.wikipedia.org</td></tr>
</table>

</div>
<h2 id="filelinks">File usage</h2>
<div id='mw-imagepage-section-linkstoimage'>
<p>The following page uses this file:
</p><ul class="mw-imagepage-linkstoimage">
<li class="mw-imagepage-linkstoimage-ns0"><a href="/wiki/Electronic_symbol" title="Electronic symbol">Electronic symbol</a></li>
</ul>
</div>
<h2 id="globalusage">Global file usage</h2>
<div id="mw-imagepage-section-globalusage"><p>The following other wikis use this file:
</p><ul>
<li class='mw-gu-onwiki-bn_wikipedia_org'>Usage on bn.wikipedia.org
<ul>	<li><a class="external" href="https://bn.wikipedia.org/wiki/%E0%A6%87%E0%A6%B2%E0%A7%87%E0%A6%95%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%A8%E0%A6%BF%E0%A6%95_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A7%80%E0%A6%95">ইলেকট্রনিক প্রতীক</a></li>
</ul></li>
<li class='mw-gu-onwiki-lv_wikipedia_org'>Usage on lv.wikipedia.org
<ul>	<li><a class="external" href="https://lv.wikipedia.org/wiki/Elektroniskais_simbols">Elektroniskais simbols</a></li>
</ul></li>
</ul>
</div><h2 id="metadata">Metadata</h2>
<div class="mw-content-ltr mw-imagepage-section-metadata" lang="en" dir="ltr"><p>This file contains additional information, probably added from the digital camera or scanner used to create or digitize it.
</p><p>
If the file has been modified from its original state, some details may not fully reflect the modified file.</p><table id="mw_metadata" class="mw_metadata collapsed">
<tbody><tr class="exif-objectname"><th>Short title</th><td>Zener diode symbol</td></tr><tr class="exif-imagewidth mw-metadata-collapsible"><th>Width</th><td>35</td></tr><tr class="exif-imagelength mw-metadata-collapsible"><th>Height</th><td>40.065918</td></tr></tbody></table>
</div><!--esi <esi:include src="/esitest-fa8a495983347898/content" /> --><noscript><img src="https://auth.wikimedia.org/loginwiki/wiki/Special:CentralAutoLogin/start?useformat=mobile&amp;type=1x1&amp;usesul3=1" alt="" width="1" height="1" style="border: none; position: absolute;"></noscript>
<div class="printfooter" data-nosnippet="">Retrieved from "<a dir="ltr" href="https://en.wikipedia.org/wiki/File:Enh_N_channel_Mosfet.svg">https://en.wikipedia.org/wiki/File:Enh_N_channel_Mosfet.svg</a>"</div></div>
				
			</div>
			<div class="post-content" id="page-secondary-actions">
			</div>
		</main>
		<footer class="mw-footer minerva-footer" role="contentinfo">
			<div class="post-content footer-content">
			
			<div id="p-lang">
	    <h4>Languages</h4>
	    <section>
	        <ul id="p-variants" class="minerva-languages"></ul>
	        <ul class="minerva-languages"></ul>
	        <p>This page is not available in other languages.</p>
	    </section>
	</div>
	<div class="minerva-footer-logo">
				<img src="/static/images/mobile/copyright/wikipedia-wordmark-en.svg" alt="Wikipedia" width="120" height="18"
	style="width: 7.5em; height: 1.125em;"/>


				<ul id="footer-icons" class="footer-icons">
	<li id="footer-copyrightico"><a href="https://www.wikimedia.org/" class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"><picture><source media="(min-width: 500px)" srcset="/static/images/footer/wikimedia-button.svg" width="84" height="29"><img src="/static/images/footer/wikimedia.svg" width="25" height="25" alt="Wikimedia Foundation" lang="en" loading="lazy"></picture></a></li>
	<li id="footer-poweredbyico"><a href="https://www.mediawiki.org/" class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"><picture><source media="(min-width: 500px)" srcset="/w/resources/assets/poweredby_mediawiki.svg" width="88" height="31"><img src="/w/resources/assets/mediawiki_compact.svg" alt="Powered by MediaWiki" lang="en" width="25" height="25" loading="lazy"></picture></a></li>
</ul>
			</div>
			<ul id="footer-info" class="footer-info hlist hlist-separated">
</ul>

			<ul id="footer-places" class="footer-places hlist hlist-separated">
	<li id="footer-places-privacy"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Privacy_policy">Privacy policy</a></li>
	<li id="footer-places-about"><a href="/wiki/Wikipedia:About">About Wikipedia</a></li>
	<li id="footer-places-disclaimers"><a href="/wiki/Wikipedia:General_disclaimer">Disclaimers</a></li>
	<li id="footer-places-contact"><a href="//en.wikipedia.org/wiki/Wikipedia:Contact_us">Contact Wikipedia</a></li>
	<li id="footer-places-wm-codeofconduct"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Universal_Code_of_Conduct">Code of Conduct</a></li>
	<li id="footer-places-developers"><a href="https://developer.wikimedia.org">Developers</a></li>
	<li id="footer-places-statslink"><a href="https://stats.wikimedia.org/#/en.wikipedia.org">Statistics</a></li>
	<li id="footer-places-cookiestatement"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Cookie_statement">Cookie statement</a></li>
	<li id="footer-places-terms-use"><a href="https://foundation.m.wikimedia.org/wiki/Special:MyLanguage/Policy:Terms_of_Use">Terms of Use</a></li>
	<li id="footer-places-desktop-toggle"><a id="mw-mf-display-toggle" href="//en.wikipedia.org/w/index.php?title=File:Enh_N_channel_Mosfet.svg&amp;mobileaction=toggle_view_desktop" data-event-name="switch_to_desktop">Desktop</a></li>
</ul>

			</div>
		</footer>
			</div>
</div>
<div class="mw-portlet mw-portlet-dock-bottom emptyPortlet" id="p-dock-bottom">
        <ul>
                
        </ul>
</div>
<div class="mw-notification-area" data-mw="interface"></div>
<!-- v:8.3.1 -->
<script>(RLQ=window.RLQ||[]).push(function(){mw.config.set({"wgHostname":"mw-web.eqiad.main-84b746899f-t5dd8","wgBackendResponseTime":187,"wgPageParseReport":{"limitreport":{"cputime":"0.001","walltime":"0.002","ppvisitednodes":{"value":3,"limit":1000000},"postexpandincludesize":{"value":0,"limit":2097152},"templateargumentsize":{"value":0,"limit":2097152},"expansiondepth":{"value":1,"limit":100},"expensivefunctioncount":{"value":0,"limit":500},"unstrip-depth":{"value":0,"limit":20},"unstrip-size":{"value":0,"limit":5000000},"entityaccesscount":{"value":0,"limit":500},"timingprofile":["100.00%    0.000      1 -total"]},"cachereport":{"origin":"mw-web.eqiad.main-84b746899f-t5dd8","timestamp":"20250412072105","ttl":2592000,"transientcontent":false}}});});</script>
<script>(window.NORLQ=window.NORLQ||[]).push(function(){var ns,i,p,img;ns=document.getElementsByTagName('noscript');for(i=0;i<ns.length;i++){p=ns[i].nextSibling;if(p&&p.className&&p.className.indexOf('lazy-image-placeholder')>-1){img=document.createElement('img');img.setAttribute('src',p.getAttribute('data-mw-src'));img.setAttribute('width',p.getAttribute('data-width'));img.setAttribute('height',p.getAttribute('data-height'));img.setAttribute('alt',p.getAttribute('data-alt'));p.parentNode.replaceChild(img,p);}}});</script>
</body>
</html>
````

## File: public/images/tools/mosfet/File_Enh_P_channel_Mosfet_2.svg
````
<!DOCTYPE html>
<html class="client-nojs skin-theme-clientpref-day mf-expand-sections-clientpref-0 mf-font-size-clientpref-small mw-mf-amc-clientpref-0" lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<title>File:Enh P channel Mosfet 2.svg - Wikipedia</title>
<script>(function(){var className="client-js skin-theme-clientpref-day mf-expand-sections-clientpref-0 mf-font-size-clientpref-small mw-mf-amc-clientpref-0";var cookie=document.cookie.match(/(?:^|; )enwikimwclientpreferences=([^;]+)/);if(cookie){cookie[1].split('%2C').forEach(function(pref){className=className.replace(new RegExp('(^| )'+pref.replace(/-clientpref-\w+$|[^\w-]+/g,'')+'-clientpref-\\w+( |$)'),'$1'+pref+'$2');});}document.documentElement.className=className;}());RLCONF={"wgBreakFrames":false,"wgSeparatorTransformTable":["",""],"wgDigitTransformTable":["",""],"wgDefaultDateFormat":"dmy","wgMonthNames":["","January","February","March","April","May","June","July","August","September","October","November","December"],"wgRequestId":"ab26879f-a727-41b5-aeb1-4ba48b2fa066","wgCanonicalNamespace":"File","wgCanonicalSpecialPageName":false,"wgNamespaceNumber":6,"wgPageName":"File:Enh_P_channel_Mosfet_2.svg","wgTitle":"Enh P channel Mosfet 2.svg","wgCurRevisionId":0,"wgRevisionId":0,"wgArticleId":0,"wgIsArticle":true,"wgIsRedirect":false,"wgAction":"view","wgUserName":null,"wgUserGroups":["*"],"wgPageViewLanguage":"en","wgPageContentLanguage":"en","wgPageContentModel":"wikitext","wgRelevantPageName":"File:Enh_P_channel_Mosfet_2.svg","wgRelevantArticleId":0,"wgIsProbablyEditable":false,"wgRelevantPageIsProbablyEditable":false,"wgRestrictionCreate":[],"wgNoticeProject":"wikipedia","wgCiteReferencePreviewsActive":false,"wgFlaggedRevsParams":{"tags":{"status":{"levels":1}}},"wgMediaViewerOnClick":true,"wgMediaViewerEnabledByDefault":true,"wgPopupsFlags":0,"wgVisualEditor":{"pageLanguageCode":"en","pageLanguageDir":"ltr","pageVariantFallbacks":"en"},"wgMFMode":"stable","wgMFAmc":false,"wgMFAmcOutreachActive":false,"wgMFAmcOutreachUserEligible":false,"wgMFLazyLoadImages":true,"wgMFEditNoticesFeatureConflict":false,"wgMFDisplayWikibaseDescriptions":{"search":true,"watchlist":true,"tagline":false,"nearby":true},"wgMFIsSupportedEditRequest":true,"wgMFScriptPath":"","wgWMESchemaEditAttemptStepOversample":false,"wgWMEPageLength":0,"wgEditSubmitButtonLabelPublish":true,"wgSectionTranslationTargetLanguages":["ab","ace","ady","af","alt","am","ami","an","ang","ann","anp","ar","arc","ary","arz","as","ast","atj","av","avk","awa","ay","az","azb","ba","ban","bar","bbc","bcl","bdr","be","be-tarask","bew","bg","bho","bi","bjn","blk","bm","bn","bo","bpy","br","bs","btm","bug","bxr","ca","cbk-zam","cdo","ce","ceb","ch","chr","chy","ckb","co","cr","crh","cs","csb","cu","cv","cy","da","dag","de","dga","din","diq","dsb","dtp","dty","dv","dz","ee","el","eml","en","eo","es","et","eu","ext","fa","fat","ff","fi","fj","fo","fon","fr","frp","frr","fur","fy","ga","gag","gan","gcr","gd","gl","glk","gn","gom","gor","got","gpe","gsw","gu","guc","gur","guw","gv","ha","hak","haw","he","hi","hif","hr","hsb","ht","hu","hy","hyw","ia","iba","id","ie","ig","igl","ik","ilo","inh","io","is","it","iu","ja","jam","jbo","jv","ka","kaa","kab","kbd","kbp","kcg","kg","kge","ki","kk","kl","km","kn","knc","ko","koi","krc","ks","ksh","ku","kus","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","lld","lmo","ln","lo","lt","ltg","lv","lzh","mad","mai","map-bms","mdf","mg","mhr","mi","min","mk","ml","mn","mni","mnw","mos","mr","mrj","ms","mt","mwl","my","myv","mzn","nah","nan","nap","nb","nds","nds-nl","ne","new","nia","nl","nn","nov","nqo","nr","nrm","nso","nv","ny","oc","olo","om","or","os","pa","pag","pam","pap","pcd","pcm","pdc","pfl","pi","pih","pl","pms","pnb","pnt","ps","pt","pwn","qu","rm","rmy","rn","ro","roa-tara","rsk","ru","rue","rup","rw","sa","sah","sat","sc","scn","sco","sd","se","sg","sgs","sh","shi","shn","si","simple","sk","skr","sl","sm","smn","sn","so","sq","sr","srn","ss","st","stq","su","sv","sw","syl","szl","szy","ta","tay","tcy","tdd","te","tet","tg","th","ti","tig","tk","tl","tly","tn","to","tpi","tr","trv","ts","tt","tum","tw","ty","tyv","udm","ug","uk","ur","uz","ve","vec","vep","vi","vls","vo","vro","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zgh","zh","zu"],"isLanguageSearcherCXEntrypointEnabled":false,"mintEntrypointLanguages":["tn","vec","ast","lmo"],"wgCheckUserClientHintsHeadersJsApi":["brands","architecture","bitness","fullVersionList","mobile","model","platform","platformVersion"],"GEHomepageSuggestedEditsEnableTopics":true,"wgGETopicsMatchModeEnabled":false,"wgGELevelingUpEnabledForUser":false,"wgMinervaPermissions":{"watchable":true,"watch":false},"wgMinervaFeatures":{"beta":false,"donateBanner":true,"donate":false,"mobileOptionsLink":true,"categories":false,"pageIssues":true,"talkAtTop":true,"historyInPageActions":false,"overflowSubmenu":false,"tabsOnSpecials":true,"personalMenu":false,"mainMenuExpanded":false,"echo":true,"nightMode":true},"wgMinervaDownloadNamespaces":[0]};
RLSTATE={"ext.globalCssJs.user.styles":"ready","site.styles":"ready","user.styles":"ready","ext.globalCssJs.user":"ready","user":"ready","user.options":"loading","mediawiki.interface.helpers.styles":"ready","mediawiki.action.view.filepage":"ready","skins.minerva.styles":"ready","skins.minerva.content.styles.images":"ready","mediawiki.hlist":"ready","skins.minerva.codex.styles":"ready","skins.minerva.icons":"ready","filepage":"ready","skins.minerva.amc.styles":"ready","ext.wikimediamessages.styles":"ready","mobile.init.styles":"ready"};RLPAGEMODULES=["mediawiki.interface.helpers","mediawiki.action.view.metadata","site","mediawiki.page.ready","skins.minerva.scripts","ext.centralNotice.geoIP","ext.centralNotice.startUp","ext.gadget.switcher","ext.urlShortener.toolbar","ext.centralauth.centralautologin","ext.popups","mobile.init","ext.echo.centralauth","ext.eventLogging","ext.wikimediaEvents","ext.navigationTiming","ext.cx.eventlogging.campaigns","ext.cx.entrypoints.languagesearcher.init","mw.externalguidance.init","ext.checkUser.clientHints"];</script>
<script>(RLQ=window.RLQ||[]).push(function(){mw.loader.impl(function(){return["user.options@12s5i",function($,jQuery,require,module){mw.user.tokens.set({"patrolToken":"+\\","watchToken":"+\\","csrfToken":"+\\"});
}];});});</script>
<link rel="stylesheet" href="/w/load.php?lang=en&amp;modules=ext.wikimediamessages.styles%7Cfilepage%7Cmediawiki.action.view.filepage%7Cmediawiki.hlist%7Cmediawiki.interface.helpers.styles%7Cmobile.init.styles%7Cskins.minerva.amc.styles%7Cskins.minerva.codex.styles%7Cskins.minerva.content.styles.images%7Cskins.minerva.icons%2Cstyles&amp;only=styles&amp;skin=minerva">
<script async="" src="/w/load.php?lang=en&amp;modules=startup&amp;only=scripts&amp;raw=1&amp;skin=minerva"></script>
<link rel="stylesheet" href="https://commons.wikimedia.org/w/index.php?title=MediaWiki:Filepage.css&amp;action=raw&amp;ctype=text/css">
<meta name="ResourceLoaderDynamicStyles" content="">
<link rel="stylesheet" href="/w/load.php?lang=en&amp;modules=site.styles&amp;only=styles&amp;skin=minerva">
<meta name="generator" content="MediaWiki 1.44.0-wmf.24">
<meta name="referrer" content="origin">
<meta name="referrer" content="origin-when-cross-origin">
<meta name="robots" content="max-image-preview:standard">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#eaecf0">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/1200px-Enh_P_channel_Mosfet_2.svg.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1371">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/800px-Enh_P_channel_Mosfet_2.svg.png">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="914">
<meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/640px-Enh_P_channel_Mosfet_2.svg.png">
<meta property="og:image:width" content="640">
<meta property="og:image:height" content="731">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0">
<meta property="og:title" content="File:Enh P channel Mosfet 2.svg - Wikipedia">
<meta property="og:type" content="website">
<link rel="preconnect" href="//upload.wikimedia.org">
<link rel="preconnect" href="//upload.wikimedia.org">
<link rel="manifest" href="/w/api.php?action=webapp-manifest">
<link rel="apple-touch-icon" href="/static/apple-touch/wikipedia.png">
<link rel="icon" href="/static/favicon/wikipedia.ico">
<link rel="search" type="application/opensearchdescription+xml" href="/w/rest.php/v1/search" title="Wikipedia (en)">
<link rel="EditURI" type="application/rsd+xml" href="//en.wikipedia.org/w/api.php?action=rsd">
<link rel="canonical" href="https://commons.wikimedia.org/wiki/File:Enh_P_channel_Mosfet_2.svg">
<link rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/deed.en">
<link rel="dns-prefetch" href="//meta.wikimedia.org" />
<link rel="dns-prefetch" href="auth.wikimedia.org">
</head>
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-6 ns-subject page-File_Enh_P_channel_Mosfet_2_svg rootpage-File_Enh_P_channel_Mosfet_2_svg stable skin-minerva action-view skin--responsive mw-mf-amc-disabled mw-mf"><div id="mw-mf-viewport">
	<div id="mw-mf-page-center">
		<a class="mw-mf-page-center__mask" href="#"></a>
		<header class="header-container header-chrome">
			<div class="minerva-header">
				<nav class="navigation-drawer toggle-list view-border-box">
					<input type="checkbox" id="main-menu-input"
						data-event-name="ui.mainmenu"
						class="toggle-list__checkbox" role="button" aria-haspopup="true" aria-expanded="false" aria-labelledby="mw-mf-main-menu-button">
					<label for="main-menu-input" id="mw-mf-main-menu-button" aria-hidden="true" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet toggle-list__toggle">
    <span class="minerva-icon minerva-icon--menu"></span>
<span></span>
</label>

					<div id="mw-mf-page-left" class="menu view-border-box">
	<ul id="p-navigation" class="toggle-list__list">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--home" href="/wiki/Main_Page" data-mw="interface">
					<span class="minerva-icon minerva-icon--home"></span>

					<span class="toggle-list-item__label">Home</span>
				</a>
			</li>
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--random" href="/wiki/Special:Random" data-mw="interface">
					<span class="minerva-icon minerva-icon--die"></span>

					<span class="toggle-list-item__label">Random</span>
				</a>
			</li>
			<li class="toggle-list-item skin-minerva-list-item-jsonly">
				<a class="toggle-list-item__anchor menu__item--nearby" href="/wiki/Special:Nearby" data-event-name="menu.nearby" data-mw="interface">
					<span class="minerva-icon minerva-icon--mapPin"></span>

					<span class="toggle-list-item__label">Nearby</span>
				</a>
			</li>
	</ul>
	<ul id="p-personal" class="toggle-list__list">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor mw-list-item menu__item--login" href="/w/index.php?title=Special:UserLogin&amp;returnto=File%3AEnh+P+channel+Mosfet+2.svg" data-event-name="menu.login" data-mw="interface">
					<span class="minerva-icon minerva-icon--logIn"></span>

					<span class="toggle-list-item__label">Log in</span>
				</a>
			</li>
	</ul>
	<ul id="pt-preferences" class="toggle-list__list">
			<li class="toggle-list-item skin-minerva-list-item-jsonly">
				<a class="toggle-list-item__anchor menu__item--settings" href="/w/index.php?title=Special:MobileOptions&amp;returnto=File%3AEnh+P+channel+Mosfet+2.svg" data-event-name="menu.settings" data-mw="interface">
					<span class="minerva-icon minerva-icon--settings"></span>

					<span class="toggle-list-item__label">Settings</span>
				</a>
			</li>
	</ul>
			<div class="donate-banner">
				<a href="https://donate.wikimedia.org/?wmf_source=donate&amp;wmf_medium=sidebar&amp;wmf_campaign=en.wikipedia.org&amp;uselang=en" class="donate-banner__link"
					data-event-name="menu.donateBanner">
					<div class="donate-banner__text-container">
						<span class="donate-banner__text">Donate Now</span>
						<span class="donate-banner__subtitle">If Wikipedia is useful to you, please give today.</span>
					</div>
					<picture>
						<source
			    			srcset="https://en.wikipedia.org/static/images/donate/donate.png"
			   				media="(prefers-reduced-motion)" />
						<img src="https://en.wikipedia.org/static/images/donate/donate.gif" alt="" class="donate-banner__gif" loading="lazy">
					</picture>
				</a>
			</div>
	<ul class="hlist">
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--about" href="/wiki/Wikipedia:About" data-mw="interface">
					
					<span class="toggle-list-item__label">About Wikipedia</span>
				</a>
			</li>
			<li class="toggle-list-item ">
				<a class="toggle-list-item__anchor menu__item--disclaimers" href="/wiki/Wikipedia:General_disclaimer" data-mw="interface">
					
					<span class="toggle-list-item__label">Disclaimers</span>
				</a>
			</li>
	</ul>
</div>

					<label class="main-menu-mask" for="main-menu-input"></label>
				</nav>
				<div class="branding-box">
					<a href="/wiki/Main_Page">
						<span><img src="/static/images/mobile/copyright/wikipedia-wordmark-en.svg" alt="Wikipedia" width="120" height="18"
	style="width: 7.5em; height: 1.125em;"/>

</span>
						
					</a>
				</div>
					<form action="/w/index.php" method="get" class="minerva-search-form">
				<div class="search-box">
					<input type="hidden" name="title" value="Special:Search"/>
					<input class="search skin-minerva-search-trigger" id="searchInput"
						 type="search" name="search" placeholder="Search Wikipedia" aria-label="Search Wikipedia" autocapitalize="sentences" title="Search Wikipedia [f]" accesskey="f">
					<span class="search-box-icon-overlay"><span class="minerva-icon minerva-icon--search"></span>
</span>
				</div>
				<button id="searchIcon" class="cdx-button cdx-button--size-large cdx-button--icon-only cdx-button--weight-quiet skin-minerva-search-trigger">
	    <span class="minerva-icon minerva-icon--search"></span>
<span>Search</span>
	</button>
</form>
		<nav class="minerva-user-navigation" aria-label="User navigation">
					
				</nav>
			</div>
		</header>
		<main id="content" class="mw-body">
			<div class="banner-container">
			<div id="siteNotice"></div>
			</div>
			
			<div class="pre-content heading-holder">
				<div class="page-heading">
					<h1 id="firstHeading" class="firstHeading mw-first-heading">File:Enh P channel Mosfet 2.svg</h1>
					<div class="tagline"></div>
				</div>
					<ul id="p-associated-pages" class="minerva__tab-container">
							<li class="minerva__tab selected mw-list-item">
								<a class="minerva__tab-text" href="/wiki/File:Enh_P_channel_Mosfet_2.svg" rel="" data-event-name="tabs.image">File</a>
							</li>
							<li class="minerva__tab new mw-list-item">
								<a class="minerva__tab-text" href="/w/index.php?title=File_talk:Enh_P_channel_Mosfet_2.svg&amp;action=edit&amp;redlink=1" rel="discussion" data-event-name="tabs.image_talk">Talk</a>
							</li>
					</ul>
				<nav class="page-actions-menu">
	<ul id="p-views" class="page-actions-menu__list minerva-icon-only-menu">
		<li id="language-selector" class="page-actions-menu__list-item">
				<a role="button" href="" data-mw="interface" data-event-name="menu.languages" title="Language" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet language-selector disabled">
				    <span class="minerva-icon minerva-icon--language"></span>
<span>Language</span>
				</a>
		</li>
		<li id="page-actions-watch" class="page-actions-menu__list-item">
				<a role="button" id="ca-watch" href="/w/index.php?title=Special:UserLogin&amp;returnto=File%3AEnh+P+channel+Mosfet+2.svg" data-event-name="menu.watch" class="cdx-button cdx-button--size-large cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--icon-only cdx-button--weight-quiet menu__item--page-actions-watch">
				    <span class="minerva-icon minerva-icon--star"></span>
<span>Watch</span>
				</a>
		</li>
	</ul>
</nav>
<!-- version 1.0.2 (change every time you update a partial) -->
				<div id="mw-content-subtitle"></div>
			</div>
			<div id="bodyContent" class="content">
				<div id="mw-content-text" class="mw-body-content"><script>function mfTempOpenSection(id){var block=document.getElementById("mf-section-"+id);block.className+=" open-block";block.previousSibling.className+=" open-block";}</script><ul id="filetoc" role="navigation"><li><a href="#file">File</a></li>
<li><a href="#filehistory">File history</a></li>
<li><a href="#filelinks">File usage</a></li>
<li><a href="#globalusage">Global file usage</a></li>
<li><a href="#metadata">Metadata</a></li></ul><div class="fullImageLink" id="file"><a href="//upload.wikimedia.org/wikipedia/commons/4/40/Enh_P_channel_Mosfet_2.svg"><img alt="File:Enh P channel Mosfet 2.svg" src="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/35px-Enh_P_channel_Mosfet_2.svg.png" decoding="async" width="35" height="40" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/52px-Enh_P_channel_Mosfet_2.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/70px-Enh_P_channel_Mosfet_2.svg.png 2x" data-file-width="35" data-file-height="40" /></a><div class="mw-filepage-resolutioninfo">Size of this PNG preview of this SVG file: <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/35px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">35 × 40 pixels</a>. <span class="mw-filepage-other-resolutions">Other resolutions: <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/210px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">210 × 240 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/420px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">420 × 480 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/672px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">672 × 768 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/896px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">896 × 1,024 pixels</a> | <a href="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/1792px-Enh_P_channel_Mosfet_2.svg.png" class="mw-thumbnail-link">1,792 × 2,048 pixels</a>.</span></div></div>
<div class="mw-content-ltr fullMedia" lang="en" dir="ltr"><p><bdi dir="ltr"><a href="//upload.wikimedia.org/wikipedia/commons/4/40/Enh_P_channel_Mosfet_2.svg" class="internal" title="Enh P channel Mosfet 2.svg">Original file</a></bdi> <span class="fileInfo">(SVG file, nominally 35 × 40 pixels, file size: 10 KB)</span>
</p></div><div class="sharedUploadNotice">
<div class="mw-parser-output">
<style data-mw-deduplicate="TemplateStyles:r1238441935">.mw-parser-output .fmbox{clear:both;margin:0.2em 0;width:100%;border:1px solid #a2a9b1;background-color:var(--background-color-interactive-subtle,#f8f9fa);box-sizing:border-box;color:var(--color-base,#202122)}.mw-parser-output .fmbox-warning{border:1px solid #bb7070;background-color:#ffdbdb}.mw-parser-output .fmbox-editnotice{background-color:transparent}.mw-parser-output .fmbox .mbox-text{border:none;padding:0.25em 0.9em;width:100%}.mw-parser-output .fmbox .mbox-image{border:none;padding:2px 0 2px 0.9em;text-align:center}.mw-parser-output .fmbox .mbox-imageright{border:none;padding:2px 0.9em 2px 0;text-align:center}.mw-parser-output .fmbox .mbox-invalid-type{text-align:center}@media screen{html.skin-theme-clientpref-night .mw-parser-output .fmbox-warning{background-color:#300}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .fmbox-warning{background-color:#300}}</style><table id="mw-sharedupload" class="plainlinks fmbox fmbox-system" role="presentation"><tbody><tr><td class="mbox-image"><span class="noviewer" typeof="mw:File"><span title="Wikimedia Commons logo"><img alt="" src="//upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/40px-Commons-logo.svg.png" decoding="async" width="30" height="40" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/60px-Commons-logo.svg.png 1.5x" data-file-width="1024" data-file-height="1376" /></span></span></td><td class="mbox-text" style="text-align: center;">This is a file from the <a href="https://commons.wikimedia.org/wiki/Main_Page" class="extiw" title="commons:Main Page">Wikimedia Commons</a>. Information from its <b><a href="https://commons.wikimedia.org/wiki/File:Enh_P_channel_Mosfet_2.svg" class="extiw" title="commons:File:Enh P channel Mosfet 2.svg">description page there</a></b> is shown below.<br /><span style="font-size: smaller;">Commons is a freely licensed media file repository. <a href="https://commons.wikimedia.org/wiki/Commons:Welcome" class="extiw" title="commons:Commons:Welcome">You can help</a>.</span></td></tr></tbody></table>
</div>
</div>
<div id="shared-image-desc"><div class="mw-content-ltr mw-parser-output" lang="en" dir="ltr"><div class="mw-heading mw-heading2"><h2 id="Summary">Summary</h2></div>
<div class="hproduct commons-file-information-table">
<table class="fileinfotpl-type-information vevent" dir="ltr">

<tbody><tr>
<td id="fileinfotpl_desc" class="fileinfo-paramfield" lang="en">Description<span class="summary fn" style="display:none">Enh P channel Mosfet 2.svg</span></td>
<td class="description">
<div class="description en" dir="ltr" lang="en"><span class="language en" title="English"><b>English: </b></span> Enhancement mode, P-channel MOSFET</div></td>
</tr>

<tr>
<td id="fileinfotpl_date" class="fileinfo-paramfield" lang="en">Date</td>
<td lang="en">
<time class="dtstart" datetime="2016-07-20" lang="en" dir="ltr" style="white-space:nowrap">20 July 2016</time></td>
</tr>

<tr>
<td id="fileinfotpl_src" class="fileinfo-paramfield" lang="en">Source</td>
<td>
<span class="int-own-work" lang="en">Own work</span></td>
</tr>

<tr>
<td id="fileinfotpl_aut" class="fileinfo-paramfield" lang="en">Author</td>
<td>
<a href="//commons.wikimedia.org/w/index.php?title=User:ErikBuer&amp;action=edit&amp;redlink=1" class="new" title="User:ErikBuer (page does not exist)">ErikBuer</a></td>
</tr>


</tbody></table>
</div>
<div class="mw-heading mw-heading2"><h2 id="Licensing">Licensing</h2></div>
<div style="clear:both; margin:0.5em auto; background-color:var(--background-color-interactive,#eaecf0); color:inherit; border:2px solid var(--border-color-subtle,#c8ccd1); padding:8px; direction:ltr;" class="licensetpl_wrapper"><div class="center" style="font-weight:bold;"><div lang="en" dir="ltr" class="description en" style="display:inline;">I, the copyright holder of this work, hereby publish it under the following license:</div></div>
<div class="responsive-license-cc layouttemplate licensetpl" dir="ltr" lang="en"><div class="rlicense-icons"><span class="skin-invert" typeof="mw:File"><span title="w:en:Creative Commons"><img alt="w:en:Creative Commons" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CC_some_rights_reserved.svg/120px-CC_some_rights_reserved.svg.png" decoding="async" width="90" height="36" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CC_some_rights_reserved.svg/250px-CC_some_rights_reserved.svg.png 1.5x" data-file-width="744" data-file-height="300"></span></span><br>
<span class="skin-invert" typeof="mw:File"><span title="attribution"><img alt="attribution" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cc-by_new_white.svg/40px-Cc-by_new_white.svg.png" decoding="async" width="24" height="24" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cc-by_new_white.svg/60px-Cc-by_new_white.svg.png 2x" data-file-width="64" data-file-height="64"></span></span> <span class="skin-invert" typeof="mw:File"><span title="share alike"><img alt="share alike" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Cc-sa_white.svg/40px-Cc-sa_white.svg.png" decoding="async" width="24" height="24" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Cc-sa_white.svg/60px-Cc-sa_white.svg.png 2x" data-file-width="64" data-file-height="64"></span></span></div><div class="rlicense-text"><div class="rlicense-declaration">This file is licensed under the <a href="https://en.wikipedia.org/wiki/en:Creative_Commons" class="extiw" title="w:en:Creative Commons">Creative Commons</a> <a href="//creativecommons.org/licenses/by-sa/4.0/deed.en" class="extiw" title="creativecommons:by-sa/4.0/deed.en">Attribution-Share Alike 4.0 International</a> license.</div><div class="rlicense-desc" style="text-align:start;" lang="en">
<dl><dd>You are free:
<ul><li><b>to share</b> – to copy, distribute and transmit the work</li>
<li><b>to remix</b> – to adapt the work</li></ul></dd>
<dd>Under the following conditions:
<ul><li><b>attribution</b> – You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.</li>
<li><b>share alike</b> – If you remix, transform, or build upon the material, you must distribute your contributions under the <a href="https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses" class="extiw" title="ccorg:share-your-work/licensing-considerations/compatible-licenses">same or compatible license</a> as the original.</li></ul></dd></dl></div><span class="licensetpl_link" style="display:none;">https://creativecommons.org/licenses/by-sa/4.0</span><span class="licensetpl_short" style="display:none;">CC BY-SA 4.0 </span><span class="licensetpl_long" style="display:none;">Creative Commons Attribution-Share Alike 4.0 </span><span class="licensetpl_link_req" style="display:none;">true</span><span class="licensetpl_attr_req" style="display:none;">true</span></div></div></div><h1 class="mw-slot-header"><mediainfoslotheader></mediainfoslotheader></h1><mediainfoview style="display: none"><mediainfoviewcaptions><div class="wbmi-entityview-captionsPanel oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><h3 class="wbmi-entityview-captions-header">Captions</h3><div class="wbmi-entityview-caption oo-ui-layout oo-ui-horizontalLayout"><label class="wbmi-language-label oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement-label oo-ui-labelElement oo-ui-labelWidget">English</label><div lang="en" dir="ltr" class="wbmi-caption-value wbmi-entityview-emptyCaption">Add a one-line explanation of what this file represents</div></div></div></mediainfoviewcaptions><mediainfoviewstatements><div id="P180" data-mw-property="P180" data-mw-statements="[]" data-mw-formatvalue="[]" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P180 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h3 class="wbmi-statements-title">Items portrayed in this file</h3><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P180" href="https://www.wikidata.org/wiki/Special:EntityPage/P180">depicts</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"></div></div></div><div id="P170" data-mw-property="P170" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;somevalue&quot;,&quot;property&quot;:&quot;P170&quot;,&quot;hash&quot;:&quot;d3550e860f988c6675fff913440993f58f5c40c5&quot;},&quot;type&quot;:&quot;statement&quot;,&quot;qualifiers&quot;:{&quot;P2699&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P2699&quot;,&quot;hash&quot;:&quot;65f99397bb0ae438d3e967a65af3b6885fd1279f&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}],&quot;P4174&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P4174&quot;,&quot;hash&quot;:&quot;e2458a265a60816013f9382211a03ce6b8212e04&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}],&quot;P2093&quot;:[{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P2093&quot;,&quot;hash&quot;:&quot;88912ddf9556401875635071513421afa9ff503a&quot;,&quot;datavalue&quot;:{&quot;value&quot;:&quot;ErikBuer&quot;,&quot;type&quot;:&quot;string&quot;}}]},&quot;qualifiers-order&quot;:[&quot;P2699&quot;,&quot;P4174&quot;,&quot;P2093&quot;],&quot;id&quot;:&quot;M50258403$DAAB34AF-2CB1-427B-8DBB-B6EFD0A1F297&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:170,\&quot;id\&quot;:\&quot;P170\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P170\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P170\&quot;>creator<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;creator&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:2699,\&quot;id\&quot;:\&quot;P2699\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P2699\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P2699\&quot;>URL<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;URL&quot;}}},&quot;{\&quot;value\&quot;:\&quot;https:\\\/\\\/commons.wikimedia.org\\\/wiki\\\/user:ErikBuer\&quot;,\&quot;type\&quot;:\&quot;string\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P2699&quot;:&quot;<a target=\&quot;_blank\&quot; rel=\&quot;nofollow\&quot; class=\&quot;external free\&quot; href=\&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer\&quot;>https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P2699&quot;:&quot;https:\/\/commons.wikimedia.org\/wiki\/user:ErikBuer&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:4174,\&quot;id\&quot;:\&quot;P4174\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P4174\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P4174\&quot;>Wikimedia username<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;Wikimedia username&quot;}}},&quot;{\&quot;value\&quot;:\&quot;ErikBuer\&quot;,\&quot;type\&quot;:\&quot;string\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P4174&quot;:&quot;<a target=\&quot;_blank\&quot; class=\&quot;wb-external-id external\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:CentralAuth?target=ErikBuer\&quot; rel=\&quot;nofollow\&quot;>ErikBuer<\/a>&quot;,&quot;P2093&quot;:&quot;ErikBuer&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P4174&quot;:&quot;ErikBuer&quot;,&quot;P2093&quot;:&quot;ErikBuer&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:2093,\&quot;id\&quot;:\&quot;P2093\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P2093\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P2093\&quot;>author name string<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;author name string&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P170 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P170" href="https://www.wikidata.org/wiki/Special:EntityPage/P170">creator</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi>some value</bdi></h4></div></div></div><div class="wbmi-item-qualifiers"><div class="wbmi-snaklist-container"><div class="wbmi-snaklist-content"><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P2699" href="https://www.wikidata.org/wiki/Special:EntityPage/P2699">URL</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value"><a target="_blank" rel="nofollow" class="external free" href="https://commons.wikimedia.org/wiki/user:ErikBuer">https://commons.wikimedia.org/wiki/user:ErikBuer</a></span></div></div><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P4174" href="https://www.wikidata.org/wiki/Special:EntityPage/P4174">Wikimedia username</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value"><a target="_blank" class="wb-external-id external" href="https://www.wikidata.org/wiki/Special:CentralAuth?target=ErikBuer" rel="nofollow">ErikBuer</a></span></div></div><div class="wbmi-snak"><div class="wbmi-snak-value"><a target="_blank" title="d:Special:EntityPage/P2093" href="https://www.wikidata.org/wiki/Special:EntityPage/P2093">author name string</a><span class="wbmi-snak-value-separator">: </span><span class="wbmi-snak-value--value">ErikBuer</span></div></div></div></div></div></div></div></div></div></div><div id="P6216" data-mw-property="P6216" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P6216&quot;,&quot;hash&quot;:&quot;5570347fdc76d2a80732f51ea10ee4b144a084e0&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:50423863,&quot;id&quot;:&quot;Q50423863&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258403$B0176B08-9A39-4F74-A3B3-844824F23987&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:6216,\&quot;id\&quot;:\&quot;P6216\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P6216\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P6216\&quot;>copyright status<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;copyright status&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:50423863,\&quot;id\&quot;:\&quot;Q50423863\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P6216&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q50423863\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q50423863\&quot;>copyrighted<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P6216&quot;:&quot;copyrighted&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P6216 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P6216" href="https://www.wikidata.org/wiki/Special:EntityPage/P6216">copyright status</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q50423863" href="https://www.wikidata.org/wiki/Special:EntityPage/Q50423863">copyrighted</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P275" data-mw-property="P275" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P275&quot;,&quot;hash&quot;:&quot;ec6e754c5042e13b53376139e505ebd6708745a4&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:18199165,&quot;id&quot;:&quot;Q18199165&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258403$2F21B4B0-FAC1-4C27-BFB7-71430C83A7A2&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:275,\&quot;id\&quot;:\&quot;P275\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P275\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P275\&quot;>copyright license<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;copyright license&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:18199165,\&quot;id\&quot;:\&quot;Q18199165\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P275&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q18199165\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q18199165\&quot;>Creative Commons Attribution-ShareAlike 4.0 International<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P275&quot;:&quot;Creative Commons Attribution-ShareAlike 4.0 International&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P275 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P275" href="https://www.wikidata.org/wiki/Special:EntityPage/P275">copyright license</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q18199165" href="https://www.wikidata.org/wiki/Special:EntityPage/Q18199165">Creative Commons Attribution-ShareAlike 4.0 International</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P7482" data-mw-property="P7482" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P7482&quot;,&quot;hash&quot;:&quot;83568a288a8b8b4714a68e7239d8406833762864&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;entity-type&quot;:&quot;item&quot;,&quot;numeric-id&quot;:66458942,&quot;id&quot;:&quot;Q66458942&quot;},&quot;type&quot;:&quot;wikibase-entityid&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258403$9F52CF27-E8DF-4F25-A177-79EAFFEC8593&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:7482,\&quot;id\&quot;:\&quot;P7482\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P7482\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P7482\&quot;>source of file<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;source of file&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;item\&quot;,\&quot;numeric-id\&quot;:66458942,\&quot;id\&quot;:\&quot;Q66458942\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P7482&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/Q66458942\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/Q66458942\&quot;>original creation by uploader<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P7482&quot;:&quot;original creation by uploader&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P7482 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P7482" href="https://www.wikidata.org/wiki/Special:EntityPage/P7482">source of file</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/Q66458942" href="https://www.wikidata.org/wiki/Special:EntityPage/Q66458942">original creation by uploader</a></bdi></h4></div></div></div></div></div></div></div></div><div id="P571" data-mw-property="P571" data-mw-statements="[{&quot;mainsnak&quot;:{&quot;snaktype&quot;:&quot;value&quot;,&quot;property&quot;:&quot;P571&quot;,&quot;hash&quot;:&quot;97ce75906af4a033c60295f345b0354c12832090&quot;,&quot;datavalue&quot;:{&quot;value&quot;:{&quot;time&quot;:&quot;+2016-07-20T00:00:00Z&quot;,&quot;timezone&quot;:0,&quot;before&quot;:0,&quot;after&quot;:0,&quot;precision&quot;:11,&quot;calendarmodel&quot;:&quot;http:\/\/www.wikidata.org\/entity\/Q1985727&quot;},&quot;type&quot;:&quot;time&quot;}},&quot;type&quot;:&quot;statement&quot;,&quot;id&quot;:&quot;M50258403$D5621228-5284-48B0-9C58-7F17353E11BC&quot;,&quot;rank&quot;:&quot;normal&quot;}]" data-mw-formatvalue="{&quot;{\&quot;value\&quot;:{\&quot;entity-type\&quot;:\&quot;property\&quot;,\&quot;numeric-id\&quot;:571,\&quot;id\&quot;:\&quot;P571\&quot;},\&quot;type\&quot;:\&quot;wikibase-entityid\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;<a target=\&quot;_blank\&quot; title=\&quot;d:Special:EntityPage\/P571\&quot; href=\&quot;https:\/\/www.wikidata.org\/wiki\/Special:EntityPage\/P571\&quot;>inception<\/a>&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;&quot;:&quot;inception&quot;}}},&quot;{\&quot;value\&quot;:{\&quot;time\&quot;:\&quot;+2016-07-20T00:00:00Z\&quot;,\&quot;timezone\&quot;:0,\&quot;before\&quot;:0,\&quot;after\&quot;:0,\&quot;precision\&quot;:11,\&quot;calendarmodel\&quot;:\&quot;http:\\\/\\\/www.wikidata.org\\\/entity\\\/Q1985727\&quot;},\&quot;type\&quot;:\&quot;time\&quot;}&quot;:{&quot;text\/html&quot;:{&quot;en&quot;:{&quot;P571&quot;:&quot;20 July 2016&quot;}},&quot;text\/plain&quot;:{&quot;en&quot;:{&quot;P571&quot;:&quot;20 July 2016&quot;}}}}" class="wbmi-entityview-statementsGroup wbmi-entityview-statementsGroup-P571 oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-framed"><div class="wbmi-statements-widget"><div class="wbmi-statement-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi><a target="_blank" title="d:Special:EntityPage/P571" href="https://www.wikidata.org/wiki/Special:EntityPage/P571">inception</a></bdi></h4></div></div></div><div class="wbmi-content-items-group"><div class="wbmi-item wbmi-item-read"><div class="wbmi-item-container"><div class="wbmi-entity-header"><div class="wbmi-entity-data"><div class="wbmi-entity-title"><h4 class="wbmi-entity-label"><bdi>20 July 2016</bdi></h4></div></div></div></div></div></div></div></div></mediainfoviewstatements></mediainfoview>
<!-- 
NewPP limit report
Parsed by mw‐api‐int.eqiad.main‐5fd4fc64fb‐v9d67
Cached time: 20250404132128
Cache expiry: 2592000
Reduced expiry: false
Complications: []
CPU time usage: 0.055 seconds
Real time usage: 0.098 seconds
Preprocessor visited node count: 204/1000000
Post‐expand include size: 9756/2097152 bytes
Template argument size: 49/2097152 bytes
Highest expansion depth: 7/100
Expensive parser function count: 1/500
Unstrip recursion depth: 0/20
Unstrip post‐expand size: 8/5000000 bytes
Lua time usage: 0.028/10.000 seconds
Lua memory usage: 970611/52428800 bytes
Number of Wikibase entities loaded: 1/400
-->
<!--
Transclusion expansion time report (%,ms,calls,template)
100.00%   78.245      1 -total
 76.38%   59.761      1 Template:Information
 23.38%   18.290      1 Template:Self
 11.97%    9.369      1 Template:Cc-by-sa-layout
  6.77%    5.299      1 Template:En
  2.05%    1.605      1 Template:Own
  1.61%    1.262      1 Template:License_template_tag
-->

<!-- Saved in parser cache with key commonswiki:pcache:50258403:|#|:idhash:wb=3!wbMobile=0 and timestamp 20250404132128 and revision id 505698540. Rendering was triggered because: page-view
 -->
</div></div>
<h2 id="filehistory">File history</h2>
<div id="mw-imagepage-section-filehistory">
<p>Click on a date/time to view the file as it appeared at that time.
</p>
<table class="wikitable filehistory">
<tr><th></th><th>Date/Time</th><th>Thumbnail</th><th>Dimensions</th><th>User</th><th>Comment</th></tr>
<tr><td>current</td><td class="filehistory-selected" style="white-space: nowrap;"><a href="//upload.wikimedia.org/wikipedia/commons/4/40/Enh_P_channel_Mosfet_2.svg">14:52, 20 July 2016</a></td><td><a href="//upload.wikimedia.org/wikipedia/commons/4/40/Enh_P_channel_Mosfet_2.svg"><img alt="Thumbnail for version as of 14:52, 20 July 2016" src="//upload.wikimedia.org/wikipedia/commons/thumb/4/40/Enh_P_channel_Mosfet_2.svg/105px-Enh_P_channel_Mosfet_2.svg.png" decoding="async" loading="lazy" width="105" height="120" data-file-width="35" data-file-height="40" /></a></td><td>35 × 40 <span style="white-space: nowrap;">(10 KB)</span></td><td><a href="/w/index.php?title=User:ErikBuer&amp;action=edit&amp;redlink=1" class="new mw-userlink" title="User:ErikBuer (page does not exist)"><bdi>ErikBuer</bdi></a></td><td dir="ltr">Cross-wiki upload from en.wikipedia.org</td></tr>
</table>

</div>
<h2 id="filelinks">File usage</h2>
<div id='mw-imagepage-section-linkstoimage'>
<p>The following page uses this file:
</p><ul class="mw-imagepage-linkstoimage">
<li class="mw-imagepage-linkstoimage-ns0"><a href="/wiki/Electronic_symbol" title="Electronic symbol">Electronic symbol</a></li>
</ul>
</div>
<h2 id="globalusage">Global file usage</h2>
<div id="mw-imagepage-section-globalusage"><p>The following other wikis use this file:
</p><ul>
<li class='mw-gu-onwiki-bn_wikipedia_org'>Usage on bn.wikipedia.org
<ul>	<li><a class="external" href="https://bn.wikipedia.org/wiki/%E0%A6%87%E0%A6%B2%E0%A7%87%E0%A6%95%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%A8%E0%A6%BF%E0%A6%95_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A7%80%E0%A6%95">ইলেকট্রনিক প্রতীক</a></li>
</ul></li>
<li class='mw-gu-onwiki-lv_wikipedia_org'>Usage on lv.wikipedia.org
<ul>	<li><a class="external" href="https://lv.wikipedia.org/wiki/Elektroniskais_simbols">Elektroniskais simbols</a></li>
</ul></li>
</ul>
</div><h2 id="metadata">Metadata</h2>
<div class="mw-content-ltr mw-imagepage-section-metadata" lang="en" dir="ltr"><p>This file contains additional information, probably added from the digital camera or scanner used to create or digitize it.
</p><p>
If the file has been modified from its original state, some details may not fully reflect the modified file.</p><table id="mw_metadata" class="mw_metadata collapsed">
<tbody><tr class="exif-objectname"><th>Short title</th><td>Zener diode symbol</td></tr><tr class="exif-imagewidth mw-metadata-collapsible"><th>Width</th><td>35</td></tr><tr class="exif-imagelength mw-metadata-collapsible"><th>Height</th><td>40.065918</td></tr></tbody></table>
</div><!--esi <esi:include src="/esitest-fa8a495983347898/content" /> --><noscript><img src="https://auth.wikimedia.org/loginwiki/wiki/Special:CentralAutoLogin/start?useformat=mobile&amp;type=1x1&amp;usesul3=1" alt="" width="1" height="1" style="border: none; position: absolute;"></noscript>
<div class="printfooter" data-nosnippet="">Retrieved from "<a dir="ltr" href="https://en.wikipedia.org/wiki/File:Enh_P_channel_Mosfet_2.svg">https://en.wikipedia.org/wiki/File:Enh_P_channel_Mosfet_2.svg</a>"</div></div>
				
			</div>
			<div class="post-content" id="page-secondary-actions">
			</div>
		</main>
		<footer class="mw-footer minerva-footer" role="contentinfo">
			<div class="post-content footer-content">
			
			<div id="p-lang">
	    <h4>Languages</h4>
	    <section>
	        <ul id="p-variants" class="minerva-languages"></ul>
	        <ul class="minerva-languages"></ul>
	        <p>This page is not available in other languages.</p>
	    </section>
	</div>
	<div class="minerva-footer-logo">
				<img src="/static/images/mobile/copyright/wikipedia-wordmark-en.svg" alt="Wikipedia" width="120" height="18"
	style="width: 7.5em; height: 1.125em;"/>


				<ul id="footer-icons" class="footer-icons">
	<li id="footer-copyrightico"><a href="https://www.wikimedia.org/" class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"><picture><source media="(min-width: 500px)" srcset="/static/images/footer/wikimedia-button.svg" width="84" height="29"><img src="/static/images/footer/wikimedia.svg" width="25" height="25" alt="Wikimedia Foundation" lang="en" loading="lazy"></picture></a></li>
	<li id="footer-poweredbyico"><a href="https://www.mediawiki.org/" class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"><picture><source media="(min-width: 500px)" srcset="/w/resources/assets/poweredby_mediawiki.svg" width="88" height="31"><img src="/w/resources/assets/mediawiki_compact.svg" alt="Powered by MediaWiki" lang="en" width="25" height="25" loading="lazy"></picture></a></li>
</ul>
			</div>
			<ul id="footer-info" class="footer-info hlist hlist-separated">
</ul>

			<ul id="footer-places" class="footer-places hlist hlist-separated">
	<li id="footer-places-privacy"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Privacy_policy">Privacy policy</a></li>
	<li id="footer-places-about"><a href="/wiki/Wikipedia:About">About Wikipedia</a></li>
	<li id="footer-places-disclaimers"><a href="/wiki/Wikipedia:General_disclaimer">Disclaimers</a></li>
	<li id="footer-places-contact"><a href="//en.wikipedia.org/wiki/Wikipedia:Contact_us">Contact Wikipedia</a></li>
	<li id="footer-places-wm-codeofconduct"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Universal_Code_of_Conduct">Code of Conduct</a></li>
	<li id="footer-places-developers"><a href="https://developer.wikimedia.org">Developers</a></li>
	<li id="footer-places-statslink"><a href="https://stats.wikimedia.org/#/en.wikipedia.org">Statistics</a></li>
	<li id="footer-places-cookiestatement"><a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Cookie_statement">Cookie statement</a></li>
	<li id="footer-places-terms-use"><a href="https://foundation.m.wikimedia.org/wiki/Special:MyLanguage/Policy:Terms_of_Use">Terms of Use</a></li>
	<li id="footer-places-desktop-toggle"><a id="mw-mf-display-toggle" href="//en.wikipedia.org/w/index.php?title=File:Enh_P_channel_Mosfet_2.svg&amp;mobileaction=toggle_view_desktop" data-event-name="switch_to_desktop">Desktop</a></li>
</ul>

			</div>
		</footer>
			</div>
</div>
<div class="mw-portlet mw-portlet-dock-bottom emptyPortlet" id="p-dock-bottom">
        <ul>
                
        </ul>
</div>
<div class="mw-notification-area" data-mw="interface"></div>
<!-- v:8.3.1 -->
<script>(RLQ=window.RLQ||[]).push(function(){mw.config.set({"wgHostname":"mw-web.eqiad.main-84b746899f-lvh4m","wgBackendResponseTime":164,"wgPageParseReport":{"limitreport":{"cputime":"0.001","walltime":"0.002","ppvisitednodes":{"value":3,"limit":1000000},"postexpandincludesize":{"value":0,"limit":2097152},"templateargumentsize":{"value":0,"limit":2097152},"expansiondepth":{"value":1,"limit":100},"expensivefunctioncount":{"value":0,"limit":500},"unstrip-depth":{"value":0,"limit":20},"unstrip-size":{"value":0,"limit":5000000},"entityaccesscount":{"value":0,"limit":500},"timingprofile":["100.00%    0.000      1 -total"]},"cachereport":{"origin":"mw-web.eqiad.main-84b746899f-lvh4m","timestamp":"20250412072703","ttl":2592000,"transientcontent":false}}});});</script>
<script>(window.NORLQ=window.NORLQ||[]).push(function(){var ns,i,p,img;ns=document.getElementsByTagName('noscript');for(i=0;i<ns.length;i++){p=ns[i].nextSibling;if(p&&p.className&&p.className.indexOf('lazy-image-placeholder')>-1){img=document.createElement('img');img.setAttribute('src',p.getAttribute('data-mw-src'));img.setAttribute('width',p.getAttribute('data-width'));img.setAttribute('height',p.getAttribute('data-height'));img.setAttribute('alt',p.getAttribute('data-alt'));p.parentNode.replaceChild(img,p);}}});</script>
</body>
</html>
````

## File: public/images/site.webmanifest
````
{"name":"","short_name":"","icons":[{"src":"/android-chrome-192x192.png","sizes":"192x192","type":"image/png"},{"src":"/android-chrome-512x512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#ffffff","background_color":"#ffffff","display":"standalone"}
````

## File: public/.nojekyll
````

````

## File: public/blog-data.json
````json
[
  {
    "slug": "i2c-hdmi-hacks",
    "metadata": {
      "title": "I2C HDMI Hacks",
      "date": "2025-05-08",
      "excerpt": "Hijack HDMI’s hidden DDC/CI I²C bus to automate input switching from Python on a Raspberry Pi—no remote required.",
      "tags": [
        "i2c",
        "hacking",
        "linux",
        "raspberrypi",
        "python",
        "hdmi",
        "ddc"
      ],
      "author": "ril3y",
      "coverImage": "/images/blog/i2c-hdmi-hacks/cover.png"
    }
  },
  {
    "slug": "custom-protocol-bruh",
    "metadata": {
      "title": "Custom protocol bruh?",
      "date": "2025-04-15",
      "excerpt": "Creating a custom protocol decoder for the Saleae logic analyzer.",
      "tags": [
        "saleae",
        "firmware"
      ],
      "author": "Riley Porter",
      "coverImage": "/images/blog/custom-protocol-bruh/cover.png"
    }
  },
  {
    "slug": "whats-hiding-in-my-coffee-maker",
    "metadata": {
      "title": "What's Hiding In My Coffee Maker?",
      "date": "2025-04-15",
      "excerpt": "Using the PicoTag project to dump SPI flash firmware from a coffee maker and explore what's hidden inside.",
      "tags": [
        "firmware",
        "reverse engineering",
        "spi"
      ],
      "author": "Riley Porter",
      "coverImage": "/images/blog/whats-hiding-in-my-coffee-maker/concept.png"
    }
  },
  {
    "slug": "introducing-picotag",
    "metadata": {
      "title": "Introducing PicoTag: Your Pocket-Sized Hardware Hacking Assistant",
      "date": "2024-07-23",
      "excerpt": "Meet PicoTag, a modular CircuitPython firmware for the RP2040, designed for hardware interaction, testing, and exploration.",
      "tags": [
        "circuitpython",
        "rp2040",
        "picotag",
        "firmware",
        "hacking",
        "hardware",
        "cli",
        "modular"
      ],
      "author": "Riley Porter",
      "coverImage": "/images/blog/introducing-picotag/concept.png"
    }
  },
  {
    "slug": "lora-without-lorawan",
    "metadata": {
      "title": "LoRa without LoRaWAN",
      "date": "2024-01-15",
      "excerpt": "Exploring the use of LoRa technology for direct P2P communication, bypassing the LoRaWAN network.",
      "tags": [
        "LoRa",
        "Hardware",
        "Radio",
        "RAK3172"
      ],
      "author": "Riley Porter",
      "coverImage": "/images/blog/lora-without-lorawan/cover.png"
    }
  }
]
````

## File: public/CNAME
````
battlewithbytes.io
````

## File: public/file.svg
````
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/robots.txt
````
# robots.txt for Battle With Bytes
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://battlewithbytes.io/sitemap.xml
````

## File: public/rss.xml
````xml
<?xml version="1.0" encoding="UTF-8"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
        <title><![CDATA[Battle With Bytes | Cybersecurity, Hardware & Software Engineering]]></title>
        <description><![CDATA[Explore cybersecurity concepts, hardware projects, and software engineering tools with interactive calculators and in-depth tutorials.]]></description>
        <link>https://battlewithbytes.io</link>
        <image>
            <url>https://battlewithbytes.io/images/logo.png</url>
            <title>Battle With Bytes | Cybersecurity, Hardware &amp; Software Engineering</title>
            <link>https://battlewithbytes.io</link>
        </image>
        <generator>RSS for Node</generator>
        <lastBuildDate>Tue, 13 May 2025 03:41:19 GMT</lastBuildDate>
        <atom:link href="https://battlewithbytes.io/rss.xml" rel="self" type="application/rss+xml"/>
        <pubDate>Tue, 13 May 2025 03:41:19 GMT</pubDate>
        <copyright><![CDATA[2025 Riley Porter]]></copyright>
        <language><![CDATA[en]]></language>
        <managingEditor><![CDATA[Riley Porter]]></managingEditor>
        <webMaster><![CDATA[Riley Porter]]></webMaster>
        <ttl>60</ttl>
        <category><![CDATA[Cybersecurity]]></category>
        <category><![CDATA[Hardware]]></category>
        <category><![CDATA[Software Engineering]]></category>
        <category><![CDATA[Technology]]></category>
        <item>
            <title><![CDATA[I2C HDMI Hacks]]></title>
            <description><![CDATA[Hijack HDMI’s hidden DDC/CI I²C bus to automate input switching from Python on a Raspberry Pi—no remote required.]]></description>
            <link>https://battlewithbytes.io/blog/i2c-hdmi-hacks</link>
            <guid isPermaLink="false">https://battlewithbytes.io/blog/i2c-hdmi-hacks</guid>
            <category><![CDATA[i2c]]></category>
            <category><![CDATA[hacking]]></category>
            <category><![CDATA[linux]]></category>
            <category><![CDATA[raspberrypi]]></category>
            <category><![CDATA[python]]></category>
            <category><![CDATA[hdmi]]></category>
            <category><![CDATA[ddc]]></category>
            <dc:creator><![CDATA[ril3y]]></dc:creator>
            <pubDate>Thu, 08 May 2025 00:00:00 GMT</pubDate>
        </item>
        <item>
            <title><![CDATA[Custom protocol bruh?]]></title>
            <description><![CDATA[Creating a custom protocol decoder for the Saleae logic analyzer.]]></description>
            <link>https://battlewithbytes.io/blog/custom-protocol-bruh</link>
            <guid isPermaLink="false">https://battlewithbytes.io/blog/custom-protocol-bruh</guid>
            <category><![CDATA[saleae]]></category>
            <category><![CDATA[firmware]]></category>
            <dc:creator><![CDATA[Riley Porter]]></dc:creator>
            <pubDate>Tue, 15 Apr 2025 00:00:00 GMT</pubDate>
        </item>
        <item>
            <title><![CDATA[What's Hiding In My Coffee Maker?]]></title>
            <description><![CDATA[Using the PicoTag project to dump SPI flash firmware from a coffee maker and explore what's hidden inside.]]></description>
            <link>https://battlewithbytes.io/blog/whats-hiding-in-my-coffee-maker</link>
            <guid isPermaLink="false">https://battlewithbytes.io/blog/whats-hiding-in-my-coffee-maker</guid>
            <category><![CDATA[firmware]]></category>
            <category><![CDATA[reverse engineering]]></category>
            <category><![CDATA[spi]]></category>
            <dc:creator><![CDATA[Riley Porter]]></dc:creator>
            <pubDate>Tue, 15 Apr 2025 00:00:00 GMT</pubDate>
        </item>
        <item>
            <title><![CDATA[Introducing PicoTag: Your Pocket-Sized Hardware Hacking Assistant]]></title>
            <description><![CDATA[Meet PicoTag, a modular CircuitPython firmware for the RP2040, designed for hardware interaction, testing, and exploration.]]></description>
            <link>https://battlewithbytes.io/blog/introducing-picotag</link>
            <guid isPermaLink="false">https://battlewithbytes.io/blog/introducing-picotag</guid>
            <category><![CDATA[circuitpython]]></category>
            <category><![CDATA[rp2040]]></category>
            <category><![CDATA[picotag]]></category>
            <category><![CDATA[firmware]]></category>
            <category><![CDATA[hacking]]></category>
            <category><![CDATA[hardware]]></category>
            <category><![CDATA[cli]]></category>
            <category><![CDATA[modular]]></category>
            <dc:creator><![CDATA[Riley Porter]]></dc:creator>
            <pubDate>Tue, 23 Jul 2024 00:00:00 GMT</pubDate>
        </item>
        <item>
            <title><![CDATA[LoRa without LoRaWAN]]></title>
            <description><![CDATA[Exploring the use of LoRa technology for direct P2P communication, bypassing the LoRaWAN network.]]></description>
            <link>https://battlewithbytes.io/blog/lora-without-lorawan</link>
            <guid isPermaLink="false">https://battlewithbytes.io/blog/lora-without-lorawan</guid>
            <category><![CDATA[LoRa]]></category>
            <category><![CDATA[Hardware]]></category>
            <category><![CDATA[Radio]]></category>
            <category><![CDATA[RAK3172]]></category>
            <dc:creator><![CDATA[Riley Porter]]></dc:creator>
            <pubDate>Mon, 15 Jan 2024 00:00:00 GMT</pubDate>
        </item>
    </channel>
</rss>
````

## File: public/vercel.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: scripts/blog-manager.js
````javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { Command } = require('commander');
const matter = require('gray-matter'); // Import gray-matter

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask a question and get user input
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Path to blog content directory
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const IMAGES_DIR_NAME = 'images'; // Standard name for image directories

// Ensure the blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// Function to sanitize a string for use as a slug
function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
    .trim();
}

// Function to list all blog posts
async function listBlogPosts() {
  console.log(chalk.green.bold('\nBlog Posts:\n'));

  try {
    const dirs = fs.readdirSync(BLOG_DIR);
    let postCount = 0;

    for (const dir of dirs) {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');

        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            if (frontmatter.title && frontmatter.date) {
              postCount++;
              console.log(chalk.cyan(`- ${frontmatter.title}`));
              console.log(`  Slug: ${dir}`);
              console.log(`  Date: ${frontmatter.date}`);
              if (frontmatter.excerpt) {
                console.log(`  Excerpt: ${frontmatter.excerpt.substring(0, 60)}...`);
              }
              if (frontmatter.tags && frontmatter.tags.length > 0) {
                console.log(`  Tags: ${frontmatter.tags.join(', ')}`);
              }
              console.log(''); // Add spacing
            } else {
               console.log(chalk.yellow(`- ${dir} (Missing title or date in frontmatter)`));
               console.log('');
            }
          } catch (readError) {
            console.warn(chalk.yellow(`Could not read or parse frontmatter for ${dir}: ${readError.message}`));
          }
        }
      }
    }

    if (postCount === 0) {
      console.log(chalk.yellow('No valid blog posts found.'));
    }
  } catch (error) {
    console.error(chalk.red('Error listing blog posts:'), error);
  }
}


// Function to update blog data JSON (Calls the separate generation script)
async function updateBlogData() {
    console.log(chalk.blue('Updating blog data JSON...'));
    try {
      // Assuming generate-blog-data.js is executable and in the same directory
      require('./generate-blog-data.js'); // Execute the script
    } catch (error) {
      console.error(chalk.red('Failed to update blog data:'), error);
    }
  }

// Function to create a new blog post
async function createBlogPost() {
  console.log(chalk.blue.bold('\nCreate New Blog Post\n'));

  const title = await question(chalk.yellow('Enter post title: '));
  if (!title) {
    console.log(chalk.red('Title cannot be empty. Aborting.'));
    return;
  }

  const slug = sanitizeSlug(title);
  const postDir = path.join(BLOG_DIR, slug);

  if (fs.existsSync(postDir)) {
    console.log(chalk.red(`Directory already exists for slug: ${slug}. Aborting.`));
    return;
  }

  const date = new Date().toISOString().split('T')[0]; // Default to today's date YYYY-MM-DD
  const excerpt = await question(chalk.yellow(`Enter excerpt (short summary): `));
  const tagsInput = await question(chalk.yellow(`Enter tags (comma-separated, optional): `));
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  const author = await question(chalk.yellow(`Enter author (default: Riley Porter): `)) || 'Riley Porter';


  // Create directories
  const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'blog', slug);
  
  fs.mkdirSync(postDir, { recursive: true });
  fs.mkdirSync(publicImagesDir, { recursive: true }); // Create corresponding public images directory
  
  console.log(chalk.green(`\nDirectories created:`));
  console.log(`  Blog: ${postDir}`);
  console.log(`  Images: ${publicImagesDir}`);

  // Create frontmatter string
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: "${date}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
tags: [${tags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]
author: "${author.replace(/"/g, '\\"')}"
coverImage: "/images/blog/${slug}/cover.png"
---

# ${title}

Start writing your blog post content here...

<!-- Example image: -->
<!-- ![Alt text](/images/blog/${slug}/your-image.png) -->

<!-- Remember to add your cover image to the public images directory and update the coverImage field in the frontmatter above. -->
`;

  // Create index.mdx file
  const mdxPath = path.join(postDir, 'index.mdx');
  fs.writeFileSync(mdxPath, frontmatter);

  console.log(chalk.green(`\nBlog post created successfully!`));
  console.log(`  Directory: ${postDir}`);
  console.log(`  MDX File: ${mdxPath}`);
  console.log(`  Images Dir: ${publicImagesDir}`);

  await updateBlogData(); // Update blog data after creating post
}


// Function to delete a blog post
async function deleteBlogPost() {
    console.log(chalk.red.bold('\nDelete Blog Post\n'));

    const dirs = fs.readdirSync(BLOG_DIR)
        .filter(dir => fs.statSync(path.join(BLOG_DIR, dir)).isDirectory());

    if (dirs.length === 0) {
        console.log(chalk.yellow('No blog posts found to delete.'));
        return;
    }

    console.log(chalk.yellow('Select a post to delete:'));
    dirs.forEach((dir, index) => {
        console.log(`${index + 1}: ${dir}`);
    });
    console.log('0: Cancel');

    const choice = await question(chalk.yellow('Enter the number of the post to delete: '));
    const index = parseInt(choice, 10) - 1;

    if (isNaN(index) || index < -1 || index >= dirs.length) {
        console.log(chalk.red('Invalid choice. Aborting.'));
        return;
    }

    if (index === -1) {
      console.log(chalk.blue('Deletion cancelled.'));
      return;
    }

    const slugToDelete = dirs[index];
    const postDirToDelete = path.join(BLOG_DIR, slugToDelete);

    const confirm = await question(chalk.red(`Are you sure you want to permanently delete "${slugToDelete}" and its contents? (yes/no): `));

    if (confirm.toLowerCase() === 'yes') {
        try {
            fs.rmSync(postDirToDelete, { recursive: true, force: true });
            console.log(chalk.green(`Successfully deleted post: ${slugToDelete}`));
            await updateBlogData(); // Update blog data after deleting post
        } catch (error) {
            console.error(chalk.red(`Error deleting post ${slugToDelete}:`), error);
        }
    } else {
        console.log(chalk.blue('Deletion cancelled.'));
    }
}

// Main menu function
async function showMainMenu() {
  console.log(chalk.magenta.bold('\n--- Blog Manager ---'));
  console.log('1: List Blog Posts');
  console.log('2: Create New Blog Post');
  console.log('3: Delete Blog Post');
  console.log('4: Update Blog Data JSON');
  console.log('0: Exit');

  const choice = await question(chalk.yellow('Choose an option: '));

  switch (choice) {
    case '1':
      await listBlogPosts();
      break;
    case '2':
      await createBlogPost();
      break;
    case '3':
      await deleteBlogPost();
      break;
    case '4':
      await updateBlogData();
      break;
    case '0':
      console.log(chalk.blue('Exiting Blog Manager.'));
      rl.close();
      process.exit(0); // Ensure the process exits cleanly
      return; // Added return for clarity, though process.exit stops execution
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
  }

  // Keep the menu looping unless explicitly exiting
   if (choice !== '0') {
      await showMainMenu(); // Recursive call to show menu again
   }
}

// Command-line interface setup using Commander
const program = new Command();

program
  .name('blog-manager')
  .description('CLI tool to manage blog posts')
  .version('1.1.0'); // Updated version

program
  .command('list')
  .description('List all blog posts')
  .action(async () => {
    await listBlogPosts();
    rl.close(); // Close readline after action
  });

program
  .command('create')
  .description('Create a new blog post')
  .action(async () => {
    await createBlogPost();
    rl.close(); // Close readline after action
  });

program
  .command('delete')
  .description('Delete a blog post')
  .action(async () => {
    await deleteBlogPost();
    rl.close(); // Close readline after action
  });

program
  .command('update-data')
  .description('Generate the blog data JSON file')
  .action(async () => {
    await updateBlogData();
    rl.close(); // Close readline after action
  });


// If no command is specified, show the interactive menu
if (process.argv.length <= 2) {
    showMainMenu();
} else {
    program.parse(process.argv);
}

// Ensure readline closes if Commander handles the command
// This might be redundant if actions always close rl, but adds safety
program.on('command:*', () => {
    if (!rl.closed) {
        rl.close();
    }
});
````

## File: scripts/create-blog-post.js
````javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Function to sanitize a string for use as a slug/directory name
function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .replace(/--+/g, '-');       // Replace multiple hyphens with single hyphen
}

async function createBlogPost() {
  console.log('\x1b[32m%s\x1b[0m', '🔥 Battle With Bytes - Blog Post Generator 🔥');
  console.log('This script will create a new blog post with the proper structure.\n');

  try {
    // Get blog post details
    const title = await question('Title: ');
    let slugInput = await question('Slug (URL-friendly name, e.g., "lora-without-lorawan"): ');
    
    // Sanitize the slug
    const slug = sanitizeSlug(slugInput);
    console.log(`\nUsing sanitized slug: "${slug}"`);
    
    const excerpt = await question('Excerpt (short description): ');
    const tagsInput = await question('Tags (comma-separated, e.g., "embedded,hardware,wireless"): ');
    const tags = tagsInput.split(',').map(tag => tag.trim());
    const author = await question('Author (default: "Battle With Bytes"): ') || 'Battle With Bytes';
    
    // Create directory structure
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog', slug);
    const imageDir = path.join(process.cwd(), 'public', 'images', 'blog', slug);
    
    if (fs.existsSync(blogDir)) {
      console.log('\x1b[31m%s\x1b[0m', `\nError: Blog post with slug "${slug}" already exists!`);
      rl.close();
      return;
    }
    
    fs.mkdirSync(blogDir, { recursive: true });
    fs.mkdirSync(imageDir, { recursive: true });
    
    // Create the MDX file with frontmatter
    const today = new Date().toISOString().split('T')[0];
    const mdxContent = `---
title: "${title}"
date: "${today}"
excerpt: "${excerpt}"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
author: "${author}"
coverImage: "/images/blog/${slug}/cover.jpg"
---

# ${title}

Write your blog post content here. This is a Markdown file with support for MDX components.

## Section 1

Your content goes here...

## Section 2

More content...

`;
    
    fs.writeFileSync(path.join(blogDir, 'index.mdx'), mdxContent);
    
    // Create a placeholder cover image text file
    fs.writeFileSync(
      path.join(imageDir, 'README.txt'), 
      `Place your cover image here named "cover.jpg"\n`
    );
    
    console.log('\x1b[32m%s\x1b[0m', '\nBlog post created successfully! 🎉');
    console.log('\x1b[36m%s\x1b[0m', `\nBlog post location: ${blogDir}`);
    console.log('\x1b[36m%s\x1b[0m', `Cover image location: ${imageDir}`);
    console.log('\nNext steps:');
    console.log('1. Add your cover image to the images directory');
    console.log('2. Edit the blog post content in the index.mdx file');
    console.log('3. Run the development server to preview your post');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `\nError: ${error.message}`);
  } finally {
    rl.close();
  }
}

createBlogPost();
````

## File: scripts/deploy-gh-pages.js
````javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper function to recursively delete directory
function deleteFolderRecursive(pathToDelete) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file) => {
      const curPath = path.join(pathToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
}

// Set the environment variable for production
process.env.NODE_ENV = 'production';

console.log('🚀 Starting GitHub Pages deployment...');

try {
  // Step 1: Generate blog data
  console.log('📝 Generating blog data...');
  execSync('node scripts/generate-blog-data.js', { stdio: 'inherit' });

  // Step 2: Clean the output directory if it exists
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    console.log('🧹 Cleaning output directory...');
    deleteFolderRecursive(outDir);
  }

  // Step 3: Run the build command
  console.log('🏗️ Building static site...');
  execSync('pnpm next build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Step 4: Deploy to GitHub Pages
  console.log('🚀 Deploying to GitHub Pages...');
  execSync('pnpm gh-pages -d out', { 
    stdio: 'inherit'
  });

  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
````

## File: scripts/generate-blog-data.js
````javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Path to blog content directory
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const OUTPUT_FILE = path.join(process.cwd(), 'public/blog-data.json');
const PUBLIC_BLOG_IMAGES_DIR = path.join(process.cwd(), 'public/images/blog');

// Function to generate blog data
function generateBlogData() {
  console.log('Generating blog data...');
  
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      console.error(`Blog directory not found: ${BLOG_DIR}`);
      return;
    }
    
    // Ensure the public blog images directory exists
    if (!fs.existsSync(PUBLIC_BLOG_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_BLOG_IMAGES_DIR, { recursive: true });
    }
    
    const dirs = fs.readdirSync(BLOG_DIR);
    
    if (dirs.length === 0) {
      console.log('No blog posts found.');
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify([]));
      return;
    }
    
    const blogData = [];

    dirs.forEach(dir => {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');

        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            // Basic validation
            if (!frontmatter.title || !frontmatter.date || !frontmatter.excerpt) {
              console.warn(`Skipping ${dir}: Missing required frontmatter (title, date, excerpt).`);
              return;
            }

            // Process the cover image to make it publicly accessible
            let coverImage = frontmatter.coverImage || null;
            if (coverImage && coverImage.startsWith('./')) {
              // Get source path
              const sourcePath = path.join(fullPath, coverImage.substring(2));
              
              // Set the expected public URL path regardless of copy operation
              const publicPath = `/images/blog/${dir}/${path.basename(coverImage.substring(2))}`;
              
              // Create destination directory if it doesn't exist
              const destDir = path.join(PUBLIC_BLOG_IMAGES_DIR, dir);
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              
              // Copy the image to the public directory if it exists in the source
              const destPath = path.join(destDir, path.basename(coverImage.substring(2)));
              if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
              } else {
                // Check if image already exists in public directory
                if (!fs.existsSync(destPath)) {
                  console.warn(`Cover image not found: ${sourcePath}`);
                }
              }
              
              // Use the public URL path regardless
              coverImage = publicPath;
            }
            
            // Construct post data from frontmatter
            const post = {
              slug: frontmatter.slug || dir, // Use frontmatter slug or fallback to directory name
              metadata: {
                title: frontmatter.title,
                date: frontmatter.date,
                excerpt: frontmatter.excerpt,
                tags: frontmatter.tags || [], // Default to empty array if no tags
                author: frontmatter.author || 'Riley Porter', // Default author
                coverImage: coverImage, // Use the processed cover image path
              },
            };
            blogData.push(post);
          } catch (readError) {
            console.error(`Error reading or parsing ${mdxPath}:`, readError);
          }
        }
      }
    });

    // Sort posts by date, newest first
    blogData.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));

    // Write the blog data to a JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogData, null, 2));
    console.log(`Blog data generated successfully: ${blogData.length} posts`);
  } catch (error) {
    console.error('Error generating blog data:', error);
  }
}

// Run the function
generateBlogData();
````

## File: scripts/generate-command-list.js
````javascript
const fs = require('fs');
const path = require('path');

// Get all command files
const commandsDir = path.join(__dirname, '../src/terminal/commands');
const commandFiles = fs.readdirSync(commandsDir)
  .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

// Generate import statements
const imports = commandFiles.map(file => {
  const name = path.basename(file, path.extname(file));
  return `'${name}': () => import('./commands/${file}')`;
}).join(',\n  ');

// Create the command registry file
const content = `// Auto-generated file - DO NOT EDIT
export const commandModules = {
  ${imports}
};
`;

fs.writeFileSync(
  path.join(__dirname, '../src/terminal/commandModules.ts'),
  content
);

console.log('Command modules file generated successfully!');
````

## File: scripts/generate-rss.js
````javascript
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');
const SITE_URL = 'https://battlewithbytes.io'; // From seo.ts
const SITE_TITLE = 'Battle With Bytes | Cybersecurity, Hardware & Software Engineering'; // From seo.ts
const SITE_DESCRIPTION = 'Explore cybersecurity concepts, hardware projects, and software engineering tools with interactive calculators and in-depth tutorials.'; // From seo.ts

async function generateRSSFeed() {
  console.log('Generating RSS feed...');

  const feed = new RSS({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    image_url: `${SITE_URL}/images/logo.png`, // Assuming you have a logo at public/images/logo.png
    managingEditor: 'Riley Porter', // Or your name/contact
    webMaster: 'Riley Porter',
    copyright: `${new Date().getFullYear()} Riley Porter`,
    language: 'en',
    categories: ['Cybersecurity', 'Hardware', 'Software Engineering', 'Technology'],
    pubDate: new Date().toUTCString(),
    ttl: 60, // Time to live in minutes
  });

  try {
    const postDirs = fs.readdirSync(BLOG_DIR);
    const allPosts = [];

    for (const dir of postDirs) {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');
        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            if (frontmatter.title && frontmatter.date && frontmatter.excerpt && dir) {
              allPosts.push({
                title: frontmatter.title,
                description: frontmatter.excerpt,
                url: `${SITE_URL}/blog/${dir}`, // Use directory name as slug
                guid: `${SITE_URL}/blog/${dir}`, // Unique identifier
                categories: frontmatter.tags || [],
                author: frontmatter.author || 'Riley Porter',
                date: new Date(frontmatter.date), // Ensure it's a Date object for sorting and RSS
                // enclosure: frontmatter.coverImage ? { url: `${SITE_URL}${frontmatter.coverImage}` } : undefined,
              });
            } else {
              console.warn(`Skipping ${dir}: missing title, date, excerpt, or slug.`);
            }
          } catch (readError) {
            console.warn(`Could not read or parse frontmatter for ${dir}: ${readError.message}`);
          }
        }
      }
    }

    // Sort posts by date, newest first
    allPosts.sort((a, b) => b.date - a.date);

    // Add sorted posts to the feed
    allPosts.forEach(post => {
      feed.item(post);
    });

    const rssXml = feed.xml({ indent: true });
    fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rssXml);
    console.log('RSS feed generated successfully at public/rss.xml');

  } catch (error) {
    console.error('Error generating RSS feed:', error);
  }
}

if (require.main === module) {
  generateRSSFeed().catch(err => console.error(err));
}

module.exports = generateRSSFeed; // Export for potential programmatic use
````

## File: scripts/project-manager.js
````javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const matter = require('gray-matter');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'content', 'projects');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

async function listProjects() {
  const dirs = fs.readdirSync(PROJECTS_DIR);
  let count = 0;
  for (const dir of dirs) {
    const fullPath = path.join(PROJECTS_DIR, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      const mdxPath = path.join(fullPath, 'index.mdx');
      if (fs.existsSync(mdxPath)) {
        const fileContent = fs.readFileSync(mdxPath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);
        if (frontmatter.title) {
          count++;
          console.log(chalk.green(`${count}. ${frontmatter.title} (${dir})`));
        }
      }
    }
  }
  if (count === 0) console.log(chalk.yellow('No projects found.'));
}

async function createProject() {
  console.log(chalk.cyan('\nCreate New Project'));
  const title = await question('Title: ');
  let slugInput = await question('Slug (URL-friendly name): ');
  const slug = sanitizeSlug(slugInput);
  console.log(`Using sanitized slug: "${slug}"`);
  const excerpt = await question('Short description: ');
  const tagsInput = await question('Tags (comma-separated): ');
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const author = await question('Author (default: "Battle With Bytes"): ') || 'Battle With Bytes';
  const github = await question('GitHub URL (optional): ');
  const demo = await question('Live Demo URL (optional): ');
  const defaultCoverImage = `/images/projects/${slug}/cover.png`;
  const coverImage = await question(`Cover Image URL (default: ${defaultCoverImage}): `) || defaultCoverImage;
  const enabledInput = await question('Enable this project? (yes/no, default: yes): ');
  const enabled = enabledInput.toLowerCase() === 'no' ? false : true;

  const projectDir = path.join(PROJECTS_DIR, slug);
  const imageDir = path.join(IMAGES_DIR, slug);

  if (fs.existsSync(projectDir)) {
    console.log(chalk.red(`\nError: Project with slug "${slug}" already exists!`));
    return;
  }
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(imageDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const mdxContent = `---
title: "${title}"
date: "${today}"
excerpt: "${excerpt}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
author: "${author}"
github: "${github}"
demo: "${demo}"
coverImage: "${coverImage}"
enabled: ${enabled}
---

// Write your project content here
`;
  fs.writeFileSync(path.join(projectDir, 'index.mdx'), mdxContent);
  console.log(chalk.green(`\nProject "${title}" created at ${projectDir}`));
}

async function updateProject() {
  console.log(chalk.cyan('\nUpdate Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to update.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number to update: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const mdxPath = path.join(projectDir, 'index.mdx');
  if (!fs.existsSync(mdxPath)) {
    console.log(chalk.red('Project MDX file not found.'));
    return;
  }
  let { data: frontmatter, content } = matter(fs.readFileSync(mdxPath, 'utf-8'));
  console.log(chalk.yellow('Leave blank to keep existing value.'));
  const title = await question(`Title (${frontmatter.title}): `) || frontmatter.title;
  const excerpt = await question(`Short description (${frontmatter.excerpt}): `) || frontmatter.excerpt;
  const tagsInput = await question(`Tags (comma-separated) (${frontmatter.tags.join(', ')}): `);
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : frontmatter.tags;
  const author = await question(`Author (${frontmatter.author}): `) || frontmatter.author;
  const github = await question(`GitHub URL (${frontmatter.github || ''}): `) || frontmatter.github || '';
  const demo = await question(`Live Demo URL (${frontmatter.demo || ''}): `) || frontmatter.demo || '';
  const coverImage = await question(`Cover Image URL (${frontmatter.coverImage || ''}): `) || frontmatter.coverImage || '';
  // Preserve existing date if available, otherwise use today. 'enabled' status is handled by toggleProjectEnabled or preserved here.
  const date = frontmatter.date || new Date().toISOString().split('T')[0];
  
  const newFrontmatter = {
    ...frontmatter, // Preserve existing fields like 'enabled'
    title,
    date,
    excerpt,
    tags,
    author,
    github,
    demo,
    coverImage
  };
  const newContent = matter.stringify(content, newFrontmatter);
  fs.writeFileSync(mdxPath, newContent);
  console.log(chalk.green('Project updated.'));
}

async function deleteProject() {
  console.log(chalk.cyan('\nDelete Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to delete.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number to delete: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const confirm = await question(`Are you sure you want to delete "${dirs[idx]}"? This cannot be undone! (yes/no): `);
  if (confirm.toLowerCase() === 'yes') {
    fs.rmSync(projectDir, { recursive: true, force: true });
    const imageDir = path.join(IMAGES_DIR, dirs[idx]);
    if (fs.existsSync(imageDir)) fs.rmSync(imageDir, { recursive: true, force: true });
    console.log(chalk.green('Project deleted.'));
  } else {
    console.log(chalk.yellow('Delete cancelled.'));
  }
}

async function toggleProjectEnabled() {
  console.log(chalk.cyan('\nEnable/Disable Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to enable/disable.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const mdxPath = path.join(projectDir, 'index.mdx');
  if (!fs.existsSync(mdxPath)) {
    console.log(chalk.red('Project MDX file not found.'));
    return;
  }
  let { data: frontmatter, content } = matter(fs.readFileSync(mdxPath, 'utf-8'));
  const currentlyEnabled = frontmatter.enabled === true;
  console.log(`Current status: ${currentlyEnabled ? chalk.green('Enabled') : chalk.red('Disabled')}`);
  const action = await question('Do you want to enable or disable this project? (enable/disable/cancel): ');
  if (action.toLowerCase() === 'enable') {
    if (currentlyEnabled) {
      console.log(chalk.yellow('Project is already enabled.'));
      return;
    }
    frontmatter.enabled = true;
    const newContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(mdxPath, newContent);
    console.log(chalk.green('Project enabled.'));
  } else if (action.toLowerCase() === 'disable') {
    if (!currentlyEnabled) {
      console.log(chalk.yellow('Project is already disabled.'));
      return;
    }
    frontmatter.enabled = false;
    const newContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(mdxPath, newContent);
    console.log(chalk.green('Project disabled.'));
  } else {
    console.log(chalk.yellow('No changes made.'));
  }
}

async function showMainMenu() {
  while (true) {
    console.log(chalk.magenta('\n--- Project Manager ---'));
    console.log('1. List projects');
    console.log('2. Create new project');
    console.log('3. Update project');
    console.log('4. Delete project');
    console.log('5. Enable/Disable project');
    console.log('6. Exit');
    const choice = await question('Select an option: ');
    switch (choice) {
      case '1': await listProjects(); break;
      case '2': await createProject(); break;
      case '3': await updateProject(); break;
      case '4': await deleteProject(); break;
      case '5': await toggleProjectEnabled(); break;
      case '6': rl.close(); return;
      default: console.log(chalk.red('Invalid choice.'));
    }
  }
}

showMainMenu();
````

## File: src/app/about/page.tsx
````typescript
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Riley Porter | Battle With Bytes',
  description: 'Learn about Riley Porter, a cybersecurity engineer, reverse engineer, and firmware developer specializing in malware analysis, embedded systems, and secure software development.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#111111] p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-[var(--accent-primary)] mb-6 border-b border-gray-600 pb-2">
          About Me
        </h1>

        <p className="text-[var(--foreground)] mb-4">
          Hi, I&apos;m <strong className="text-[var(--accent-primary)]">Riley Porter</strong>, a passionate cybersecurity engineer, reverse engineer, and firmware developer based in the United States. With a deep curiosity and a hands-on approach to technology, I spend my days immersed in the fascinating intersections of software, hardware, and security.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">My Work</h2>
        <p className="text-[var(--foreground)] mb-4">
          Professionally, I&apos;m dedicated to cybersecurity, specializing in malware analysis, reverse engineering, and exploit development. My toolkit regularly features <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">IDA Pro</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">YARA rules</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Python</code>, which help me dissect complex threats and secure digital environments. I&apos;m continually refining my skills, particularly in Android and Windows reverse engineering, and exploring <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Rust</code> for secure and performant software development.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Embedded Enthusiast</h2>
        <p className="text-[var(--foreground)] mb-4">
          Outside of my primary work, I find joy and creativity in embedded programming and electronics design. My projects often involve microcontrollers such as the <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Raspberry Pi Pico</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">STM32</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">nRF52840</code>, pushing the boundaries of what&apos;s possible with bare-metal programming, circuit design, and low-power solutions. Notably, my ongoing &quot;<strong className="text-[var(--accent-primary)]">Boats No Woes</strong>&quot; project exemplifies my dedication to creating practical, secure, and efficient IoT solutions.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Software and Tools</h2>
        <p className="text-[var(--foreground)] mb-4">
          I&apos;m proficient in <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Python</code>, employing it for everything from automation scripts to complex data analysis. My preferred development tools include <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">PyCharm</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Visual Studio Code</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">GitHub Actions</code> for CI/CD workflows. I&apos;m also familiar with modern frameworks and technologies like <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">FastAPI</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Next.js</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Flutter</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Flet</code>, using them to build responsive and robust applications.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Maker and Innovator</h2>
        <p className="text-[var(--foreground)] mb-4">
          In my downtime, I embrace my maker side—whether it&apos;s CNC machining, PCB design, or exploring new culinary adventures. Engineering permeates all aspects of my life, even influencing my hobbies like grilling and fishing. I love experimenting and learning through hands-on experiences.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Continuous Learner</h2>
        <p className="text-[var(--foreground)] mb-4">
          Driven by curiosity, I&apos;m always looking to deepen my understanding of advanced topics such as machine learning and firmware fuzzing. I&apos;m currently exploring the application of AI-driven automation for firmware security analysis and the use of machine learning techniques for practical, everyday problem-solving.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Connect & Explore</h2>
        <p className="text-[var(--foreground)] mb-4">
          You can also explore my open-source hardware workspace on Flux:
        </p>
        <a
          href="https://www.flux.ai/ril3y"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2 rounded bg-[#11191f] text-[var(--accent-primary)] font-semibold shadow hover:bg-[var(--accent-primary)] hover:text-black transition-colors border border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 flex items-center mt-4 mb-2"
          style={{ textDecoration: 'none' }}
        >
          <Image
            src="https://www.flux.ai/static/media/flux_icon.eca0a11ea2f721d680d9.svg"
            alt="Flux logo"
            width={24}
            height={24}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
          />
          <span className="ml-4">View my Flux workspace</span>
        </a>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Connect With Me</h2>
        <p className="text-[var(--foreground)] mb-4">
          I&apos;m always interested in discussing new projects, innovative ideas, or tackling challenging problems. Feel free to reach out if you&apos;d like to collaborate, share insights, or simply chat about tech over a cup of coffee!
        </p>

        <p className="text-[var(--foreground)] mt-8">
          Thanks for stopping by,
        </p>
        <p className="text-[var(--accent-primary)] font-semibold mt-1">
          Riley Porter
        </p>
      </div>
    </main>
  );
}
````

## File: src/app/api/contact/route.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting to prevent abuse
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3;

// Simple in-memory store for rate limiting
// In production, you would use Redis or another external store
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting - using headers for IP since NextRequest.ip may not be available
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Check rate limit
    const now = Date.now();
    if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
      // Reset counter for this IP
      ipRequestCounts[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }
    
    // Increment counter
    ipRequestCounts[ip].count += 1;
    
    // Check if rate limit exceeded
    if (ipRequestCounts[ip].count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    
    // Create a nodemailer transporter
    // NOTE: In production, use environment variables for these credentials
    const transporter = nodemailer.createTransport({
      // Replace with your SMTP settings from environment variables
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Boolean(process.env.SMTP_SECURE) || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    // Setup email data
    const mailOptions = {
      from: `"Battle With Bytes Contact Form" <${process.env.SMTP_USER}>`,
      to: 'contact@battlewithbytes.io',
      replyTo: email,
      subject: `Contact Form: ${subject || 'New message from website'}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p style="margin-top: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This email was sent from the contact form on Battle With Bytes website.
          </p>
        </div>
      `,
    };
    
    // Only actually send in production
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    } else {
      // In development, just log the email
      console.log('Email would be sent in production:');
      console.log(mailOptions);
    }
    
    return NextResponse.json({ message: 'Message sent successfully!' });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending your message.' },
      { status: 500 }
    );
  }
}
````

## File: src/app/blog/[slug]/page.tsx
````typescript
import { getBlogPostBySlug, getBlogSlugs, getBlogPostMetadata } from '@/lib/blog';
import BlogPost from '@/components/BlogPost';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Define the params type
type Params = {
  slug: string;
};

// Define the page props according to Next.js 15 requirements
interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await the params before using them
  const resolvedParams = await params;
  // Fetch only metadata using the dedicated function
  const postMetadata = getBlogPostMetadata(resolvedParams.slug);
  
  // Handle case where post is not found
  if (!postMetadata) {
    return {
      title: 'Post Not Found | Battle With Bytes',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${postMetadata.title} | Battle With Bytes`,
    description: postMetadata.excerpt,
  };
}

export function generateStaticParams(): Array<Params> {
  const slugs = getBlogSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  // Await the params before using them
  const resolvedParams = await params;
  // Fetch the full post with serialized content, awaiting the promise
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  // If post is not found, render 404 page
  if (!post) {
    notFound();
  }
  
  return (
    <main className="min-h-screen py-16 px-4">
      {/* Pass the serialized content and metadata */}
      <BlogPost content={post.content} metadata={post.metadata} />
    </main>
  );
}
````

## File: src/app/blog/tag/[tag]/page.tsx
````typescript
import { getBlogPostsByTag, getAllTags } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Metadata } from 'next';

// Define the params type
type Params = {
  tag: string;
};

// Define the page props according to Next.js 15 requirements
interface PageProps {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await the params before using them
  const resolvedParams = await params;
  const { tag } = resolvedParams;
  
  return {
    title: `Posts Tagged with ${tag} | Battle With Bytes`,
    description: `Browse all blog posts tagged with ${tag} on Battle With Bytes.`,
  };
}

export function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export default async function TagPage({ params }: PageProps) {
  // Await the params before using them
  const resolvedParams = await params;
  const { tag } = resolvedParams;
  const decodedTag = decodeURIComponent(tag);
  const posts = getBlogPostsByTag(decodedTag);
  
  if (posts.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No posts found</h1>
          <p className="mb-8">No posts were found with the tag &quot;{decodedTag}&quot;.</p>
          <Link href="/blog" className="button">Back to Blog</Link>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block bg-gray-800 text-green-400 px-4 py-2 rounded-full text-lg font-mono mb-4">
            #{decodedTag}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-mono mb-4">
            Posts Tagged with &quot;{decodedTag}&quot;
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');
            
            return (
              <article 
                key={post.slug}
                className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {post.coverImage && (
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative w-full h-56 md:h-64 overflow-hidden border-b border-gray-800">
                      <Image
                        src={post.coverImage}
                        alt={post.title || "Blog post"}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                )}
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((t: string) => (
                      <Link 
                        href={`/blog/tag/${t}`} 
                        key={t}
                        className={`bg-gray-800 px-2 py-1 rounded-full text-xs font-mono ${
                          t.toLowerCase() === decodedTag.toLowerCase() 
                            ? 'text-white border border-green-400' 
                            : 'text-green-400'
                        }`}
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.author}</span>
                    <time dateTime={post.date}>{formattedDate}</time>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/blog" 
            className="inline-block bg-transparent border border-green-400 text-green-400 px-6 py-3 rounded-md font-mono hover:bg-green-400 hover:text-black transition-colors"
          >
            Back to All Posts
          </Link>
        </div>
      </div>
    </main>
  );
}
````

## File: src/app/blog/page.tsx
````typescript
import { getBlogPostsMetadata } from '@/lib/blog';
import { format } from 'date-fns';
import BlogCard from '@/components/BlogCard';

export const metadata = {
  title: 'Blog | Battle With Bytes',
  description: 'Technical articles on cybersecurity, embedded hardware, and software engineering',
};

export default function BlogPage() {
  const posts = getBlogPostsMetadata();
  
  // Debug: Log posts received by the page component
  console.log('[DEBUG PAGE] Posts received:', posts.map(p => ({
    slug: p.slug, 
    title: p.title,
    titleExists: Boolean(p.title)
  })));
  
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 glow-text">
            <span className="text-green-400">&lt;</span> Blog <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights on cybersecurity, embedded hardware, and software engineering.
          </p>
        </header>
        
        {/* Debug info - only visible in development
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded">
            <h3 className="text-lg font-mono mb-2">Debug Info:</h3>
            <p className="mb-2">Found {posts.length} posts</p>
            <ul className="list-disc pl-5 space-y-1">
              {posts.map(post => (
                <li key={post.slug}>
                  Slug: {post.slug} | Title: "{post.title}" | 
                  Title type: {typeof post.title} | 
                  Title empty: {String(!post.title)}
                </li>
              ))}
            </ul>
          </div>
        )} */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? posts.map((post) => {
            let formattedDate = "No date";
            try {
              formattedDate = format(new Date(post.date || new Date()), 'MMMM d, yyyy');
            } catch (e) {
              console.error("Error formatting date:", e);
            }
            return (
              <BlogCard key={post.slug} post={post} formattedDate={formattedDate} />
            );
          }) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-400 text-lg">No blog posts found.</p>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
````

## File: src/app/contact/page.tsx
````typescript
"use client";
import React, { useEffect, useState } from 'react';

export default function ContactPage() {
  const [connecting, setConnecting] = useState(true);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!connecting) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    const timeout = setTimeout(() => {
      setConnecting(false);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [connecting]);

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 glow-text">
            <span className="text-green-400">&lt;</span> Contact <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question or want to collaborate? Drop me a message.
          </p>
        </header>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden backdrop-blur mb-8">
          {/* Cyber-themed header visual with CSS patterns */}
          <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-black flex flex-col items-center justify-center overflow-hidden">
            {/* CSS grid pattern */}
            <div className="absolute inset-0"
                 style={{
                   backgroundImage: 'linear-gradient(to right, rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 157, 0.1) 1px, transparent 1px)',
                   backgroundSize: '20px 20px',
                   backgroundPosition: 'center'
                 }}>
            </div>
            {/* Terminal-style welcome message */}
            <div className="z-10 text-center p-8">
              <div className="font-mono text-green-400 text-lg md:text-xl mb-3 glow-text">
                <span className="text-gray-500">&gt;</span> establishing_connection{connecting ? dots : '...'}
              </div>
              {!connecting && (
                <div className="font-mono font-bold text-red-500 text-base mb-2">failed</div>
              )}
              <div className="p-4 border border-green-400/30 bg-black/70 rounded max-w-md mx-auto">
                <p className="font-mono text-sm text-white mb-2">
                  {!connecting ? (
                    <span className="text-red-500 font-bold">CONNECTION FAILED</span>
                  ) : (
                    <span className="text-green-400">CONNECTING</span>
                  )} TO: contact@battlewithbytes.io
                </p>
                {!connecting && (
                  <p className="font-mono text-base text-green-400 mt-4">
                    Contact functionality is <span className="text-yellow-400">not currently available</span>.<br />Please check back soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
````

## File: src/app/projects/[slug]/page.tsx
````typescript
// src/app/projects/[slug]/page.tsx
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { ProjectMetadata } from '@/lib/utils/projects';
import { Metadata } from 'next';
import { generateSEO } from '@/lib/utils/seo'; 
import Image from 'next/image';
import ProjectContent from '@/components/projects/ProjectContent';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

// Define the params type
type Params = {
  slug: string;
};

// Define the page props type - aligning with Next.js 15
interface ProjectPageProps {
  params: Promise<Params>; // Params is now a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>; // searchParams is also a Promise
}

// Function to get project data (metadata and content)
async function getProjectData(slug: string): Promise<{ metadata: ProjectMetadata; content: string | null } | null> {
  const indexPath = path.join(projectsDirectory, slug, 'index.mdx');
  let indexData: matter.GrayMatterFile<string>;
  try {
    const indexFileContents = await fs.readFile(indexPath, 'utf8');
    indexData = matter(indexFileContents);
  } catch (error) {
    console.error(`Error reading index file for slug "${slug}":`, error);
    return null;
  }

  try {
    // Always use index.mdx for content
    const { content } = indexData;
    return {
      metadata: {
        slug,
        title: indexData.data.title || 'Untitled Project',
        description: indexData.data.description || 'No description',
        coverImage: indexData.data.coverImage || undefined,
      },
      content: content,
    };
  } catch (error) {
    console.error(`Error processing index.mdx for slug "${slug}":`, error);
    return {
      metadata: {
        slug,
        title: indexData.data.title || 'Untitled Project',
        description: indexData.data.description || 'No description',
        coverImage: indexData.data.coverImage || undefined,
      },
      content: '',
    };
  }
}

// Static paths generation
export async function generateStaticParams(): Promise<Params[]> {
  const projectFiles = await fs.readdir(projectsDirectory);
  return projectFiles.map(projectDir => ({ slug: projectDir }));
}

// Metadata generation
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params;
  const projectData = await getProjectData(resolvedParams.slug);

  if (!projectData) {
    // Return metadata for a 404 page if project not found
    return generateSEO({
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
      // Add other relevant SEO props for 404 if needed
    });
  }

  const { metadata } = projectData;

  // Use the centralized SEO utility
  const seoProps = generateSEO({
    title: metadata.title,
    description: metadata.description,
    // Assuming the slug is the basis for the canonical URL path
    canonical: `/projects/${resolvedParams.slug}`,
    ogImage: metadata.coverImage, // Use cover image for OG
    // Add specific type if needed, e.g., 'article' for projects
    // type: 'article', 
  });

  // Map SEOProps to Next.js Metadata type
  return {
    title: seoProps.title,
    description: seoProps.description,
    keywords: seoProps.keywords, // Assuming generateSEO provides keywords
    openGraph: {
        title: seoProps.title,
        description: seoProps.description,
        url: seoProps.canonical,
        type: 'article', // Explicitly set to 'article' for project pages
        images: seoProps.ogImage ? [{ url: seoProps.ogImage }] : [],
        siteName: 'Battle With Bytes',
    },
    twitter: {
        card: 'summary_large_image',
        title: seoProps.title,
        description: seoProps.description,
        images: seoProps.ogImage ? [seoProps.ogImage] : [],
    },
    alternates: {
        canonical: seoProps.canonical,
    },
    // Add structured data if generateSEO supports it or define it here
    // other: { ...seoProps.other },
  };
}

// The actual page component - corrected
export default async function ProjectPage({ params }: ProjectPageProps) { // Accept the props object
  // Await the params Promise before accessing slug
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const projectData = await getProjectData(slug);

  if (!projectData) {
    notFound();
  }

  const { metadata, content } = projectData;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-green-400 tracking-wider font-orbitron">
          {metadata.title}
        </h1>
        
        {metadata.coverImage && (
          <div className="relative mb-8 aspect-video w-full max-h-[400px] overflow-hidden rounded-lg border border-green-500/30 bg-gray-900/50">
            <Image 
              src={metadata.coverImage} 
              alt={`${metadata.title} cover image`}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="mt-8 bg-gray-900/30 backdrop-blur-sm border border-green-500/30 rounded-lg shadow-lg p-6">
          {content ? (
            <ProjectContent content={content} />
          ) : (
            <p className="text-gray-400 italic">Content coming soon...</p>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: src/app/projects/page.tsx
````typescript
import React from 'react';
import { Metadata } from 'next';
import { getAllProjects } from '@/lib/utils/projects'; // Utility to fetch project data
import ProjectCard from '@/components/projects/ProjectCard'; // Component to display each project
import { generateSEO } from '@/lib/utils/seo'; // SEO utility

// Generate metadata for the projects page
export const metadata: Metadata = generateSEO({
  title: 'Projects',
  description: 'A collection of personal projects spanning cybersecurity, embedded systems, software development, and more.',
  keywords: ['projects', 'portfolio', 'cybersecurity', 'embedded systems', 'software engineering', 'hardware', 'reverse engineering', 'DIY'],
});

const ProjectsPage = () => {
  const projects = getAllProjects(); // Fetch all project metadata

  return (
    <div 
      className="py-12 min-h-screen"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9)), url('/images/black.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-400 tracking-wider font-orbitron">
          PROJECTS
        </h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto font-mono">
          Exploring the intersections of hardware, software, and security. Here are some of the things I&apos;m currently working on or have built.
        </p>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 font-mono">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
````

## File: src/app/tools/mosfet-calculator/page.tsx
````typescript
import { Metadata } from 'next';
import MosfetCalculator from '@/components/tools/MosfetCalculator';
import { generateToolSchema } from '@/lib/utils/seo';
import Script from 'next/script';

// Enhanced SEO metadata
export const metadata: Metadata = {
  title: 'MOSFET Calculator | Battle With Bytes',
  description: 'Interactive MOSFET calculator for N-channel and P-channel configurations. Calculate conduction states, voltages, currents, and power dissipation for electronic circuit design.',
  keywords: ['MOSFET calculator', 'N-channel MOSFET', 'P-channel MOSFET', 'transistor calculator', 'electronics design', 'circuit analysis', 'power electronics', 'semiconductor calculator'],
  openGraph: {
    title: 'MOSFET Calculator | Battle With Bytes',
    description: 'Interactive MOSFET calculator for N-channel and P-channel configurations. Calculate conduction states, voltages, currents, and power dissipation.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/mosfet-calculator',
    images: [
      {
        url: '/images/og/mosfet-calculator.png',
        width: 1200,
        height: 630,
        alt: 'MOSFET Calculator',
      },
    ],
  },
};

export default function MosfetCalculatorPage() {
  // Tool schema for structured data
  const toolSchema = generateToolSchema(
    'MOSFET Calculator',
    'Interactive MOSFET calculator for N-channel and P-channel configurations. Calculate conduction states, voltages, currents, and power dissipation for electronic circuit design.',
    '/tools/mosfet-calculator'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      {/* Structured data for search engines */}
      <Script id="mosfet-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> MOSFET Calculator <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-3xl">
          An interactive tool for calculating MOSFET parameters, visualizing configurations, 
          and determining conduction states for both N-channel and P-channel MOSFETs.
        </p>
        
        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 mb-8">
          <MosfetCalculator />
        </div>
        
        <div className="bg-black/70 border border-gray-800 rounded-lg p-6 font-mono text-sm">
          <h3 className="text-xl font-bold mb-4 text-green-400">About This Tool</h3>
          <p className="mb-4 text-gray-300">
            This MOSFET calculator helps engineers and hobbyists determine whether a MOSFET is conducting 
            based on the applied voltages and component specifications.
          </p>
          <p className="mb-4 text-gray-300">
            The tool supports both N-channel and P-channel MOSFETs, and provides detailed calculations 
            including gate-source voltage (Vgs), drain current (Id), and power dissipation.
          </p>
          <p className="text-gray-300">
            Use this calculator to design and troubleshoot MOSFET-based circuits for switching applications, 
            power control, and signal amplification.
          </p>
        </div>
      </div>
    </main>
  );
}
````

## File: src/app/tools/ohms-law-calculator/page.tsx
````typescript
import OhmsLawCalculator from '@/components/tools/OhmsLawCalculator';
import { generateToolSchema } from '@/lib/utils/seo';
import Script from 'next/script';

// Enhanced SEO metadata
export const metadata = {
  title: 'Ohm\'s Law Calculator | Battle With Bytes',
  description: 'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations. Free online electrical engineering tool.',
  keywords: ['ohm\'s law', 'voltage calculator', 'current calculator', 'resistance calculator', 'power calculator', 'electrical engineering', 'circuit design', 'electronics tool'],
  openGraph: {
    title: 'Ohm\'s Law Calculator | Battle With Bytes',
    description: 'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/ohms-law-calculator',
    images: [
      {
        url: '/images/og/ohms-law-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Ohm\'s Law Calculator',
      },
    ],
  },
};

export default function OhmsLawCalculatorPage() {
  // Tool schema for structured data
  const toolSchema = generateToolSchema(
    'Ohm\'s Law Calculator',
    'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations.',
    '/tools/ohms-law-calculator'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      {/* Structured data for search engines */}
      <Script id="ohms-law-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Ohm&apos;s Law Calculator <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Calculate voltage, current, resistance, and power using Ohm&apos;s Law. 
          This interactive tool provides visual feedback and detailed explanations of the calculations.
        </p>
        
        <OhmsLawCalculator />
      </div>
    </main>
  );
}
````

## File: src/app/tools/wiremapper/components/Connector.tsx
````typescript
'use client';

import React, { useState, useRef, CSSProperties } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Connector as ConnectorType, Pin, Mapping, ConnectorGender } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { ConnectorRenderer } from './ConnectorRenderer';

// Define constants locally
const PIN_SIZE = 20;
const PIN_MARGIN = 4;

interface Point { x: number; y: number; }

interface ConnectorProps {
  connector: ConnectorType;
  onPinClick: (connectorId: string, pinIndex: number) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  selected: boolean;
  selectedPin: { connectorId: string; pinIndex: number; } | null;
  connectingPin: { connectorId: string; pinIndex: number; } | null; // Pin selected as connection start
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>; // Allow null
}

const pinSpacing = PIN_MARGIN * 2 + PIN_SIZE;

export const Connector: React.FC<ConnectorProps> = ({ 
  connector,
  onPinClick,
  onContextMenu,
  selected,
  selectedPin,
  connectingPin,
  dragConstraintsRef,
}) => {
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const { settings, mappings, updateConnectorPosition } = useWireMapperStore();

  const isConnected = (pinIndex: number) => {
    return mappings.some((mapping: Mapping) => 
      (mapping.startConnectorId === connector.id && mapping.startPinPos === pinIndex) ||
      (mapping.endConnectorId === connector.id && mapping.endPinPos === pinIndex)
    );
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Update position in the store
    // info.point contains the final {x, y} relative to the viewport
    // We need to adjust based on the canvas position if needed, but for now let's update directly
    // Note: framer-motion handles position updates visually via style.transform
    // We update the store to persist the logical position
    const newX = connector.x + info.offset.x;
    const newY = connector.y + info.offset.y;
    updateConnectorPosition(connector.id, newX, newY);
  };

  const getPinStyle = (pinData: { displayValue: number | string, pin: Pin }): CSSProperties => {
    const pin = pinData.pin;
    const isPinSelected = selectedPin?.connectorId === connector.id && selectedPin?.pinIndex === pin.index;
    const isPinHovered = hoveredPin === pin.index;
    const connected = isConnected(pin.index);
    const isConnectingStartPin = connectingPin?.connectorId === connector.id && connectingPin?.pinIndex === pin.index;
    const isConnectingEndPin = connectingPin?.connectorId === connector.id && connectingPin?.pinIndex === pin.index;

    // Use the pin's specific color if available, otherwise default by gender
    let pinColor = pin.config.color ?? (connector.gender === 'Male' ? '#111111' : '#333333'); 
    let borderColor = '#00ff9d'; 
    let boxShadow = `0 0 5px ${borderColor}`;

    if (connected) {
      borderColor = '#ff6b00'; 
      boxShadow = `0 0 6px ${borderColor}`;
    } else if (isPinSelected) {
      borderColor = '#ffffff'; 
      boxShadow = `0 0 8px ${borderColor}`;
    } else if (isConnectingStartPin) { // Highlight for connection start
      borderColor = '#facc15'; // Yellow-ish
      boxShadow = `0 0 8px ${borderColor}`;
    } else if (isPinHovered) {
      borderColor = '#00ffff'; 
      boxShadow = `0 0 7px ${borderColor}`;
    }

    return {
      width: PIN_SIZE,
      height: PIN_SIZE,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(8, PIN_SIZE * 0.4)}px`, 
      fontWeight: 'bold',
      backgroundColor: pinColor, // Use the potentially overridden pinColor
      border: `2px solid ${borderColor}`,
      boxShadow: boxShadow,
      color: '#e0e0e0',
      cursor: 'pointer',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      margin: '2px 0', 
    };
  };

  const nameAbove = settings.namePosition === 'above';

  const totalWidth = (connector.config.columns ?? 0) * pinSpacing + PIN_MARGIN * 2; 
  const totalHeight = (connector.config.rows ?? 0) * pinSpacing + PIN_MARGIN * 2;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const pinWrapper = target.closest('.pin-wrapper');

    if (pinWrapper) {
      const pinPosStr = pinWrapper.getAttribute('data-pin-pos');
      if (pinPosStr) {
        const pinIndex = parseInt(pinPosStr, 10);
        if (!isNaN(pinIndex)) {
          onPinClick(connector.id, pinIndex);
        } else {
          console.error("[Connector] Invalid pin position found in data attribute", pinPosStr);
        }
      } else {
        console.error("[Connector] Pin wrapper clicked, but data-pin-pos attribute missing.");
      }
    } else if (e.currentTarget === target) {
      onPinClick(connector.id, -1); // Assuming -1 means deselect or background click
    }
  };

  // Generate a CSS class string based on gender for potential styling hooks
  // Uses the correct ConnectorGender type internally
  const getGenderClass = (gender: ConnectorGender): string => {
    switch (gender) {
      case 'Male': return 'connector-male';
      case 'Female': return 'connector-female';
      default: return 'connector-unknown';
    }
  };
  const genderClass = getGenderClass(connector.gender ?? 'Unknown'); // Provide default

  return (
    <motion.div
      key={connector.id}
      initial={{ x: connector.x, y: connector.y }} // Set initial position for framer-motion
      className={`absolute group cursor-grab ${selected ? 'z-10' : 'z-0'} ${genderClass}`}
      style={{
        // transform: `rotate(${connector.position.rotation}deg)`, // Rotation handled by framer-motion if needed
        width: `${connector.width}px`, // Use calculated width
        height: `${connector.height}px`, // Use calculated height
      }}
      drag
      dragConstraints={dragConstraintsRef.current ? dragConstraintsRef : undefined} // Pass ref only if current exists
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      // Apply rotation via motion props if desired
      // initial={{ rotate: connector.position.rotation }}
      // animate={{ rotate: connector.position.rotation }}
      onContextMenu={onContextMenu}
    >
      {nameAbove && (
        <div className="text-center text-sm text-gray-300 mb-1 select-none w-full" style={{width: totalWidth}}>
          {connector.name || connector.type}
        </div>
      )}
      <div 
        className="relative p-2 bg-gray-950 rounded border border-gray-800 shadow-lg flex flex-col items-center"
        style={{
          width: totalWidth,
          minHeight: totalHeight, 
          backgroundColor: '#111111',
          borderRadius: '8px',
        }}
        onClick={handleContainerClick} 
      >
        <ConnectorRenderer
          rows={connector.config.rows ?? 0}
          cols={connector.config.columns ?? 0}
          pins={connector.pins} 
          gender={connector.gender ?? 'Unknown'}
          centerPins={connector.config.centerPinsHorizontal ?? false}
          pinSize={PIN_SIZE}
          getPinStyle={getPinStyle} 
          pinWrapperClassName="pin-wrapper" 
        />
      </div>
      {!nameAbove && (
        <div className="text-center text-sm text-gray-300 mt-1 select-none w-full" style={{width: totalWidth}}>
          {connector.name || connector.type}
        </div>
      )}
    </motion.div>
  );
}

interface PinProps {
  connectorId: string;
  pin: Pin;
  mode: string;
  isSelected: boolean;
  isConnecting: boolean;
  isHovered: boolean;
  onClick: (pinIndex: number) => void;
}

const PinComponent: React.FC<PinProps> = ({ 
  connectorId, 
  pin, 
  mode, 
  isSelected, 
  isConnecting,
  isHovered,
  onClick 
}) => {
  const { settings, mappings } = useWireMapperStore();
  
  const isConnected = mappings.some((mapping: Mapping) => 
    (mapping.startConnectorId === connectorId && mapping.startPinPos === pin.index) || 
    (mapping.endConnectorId === connectorId && mapping.endPinPos === pin.index)
  );

  // Determine pin color - Use config, fallback based on connection/selection state
  let pinColor = pin.config.color; 
  let borderColor = '#00ff9d'; 
  let textColor = '#e0e0e0';
  let boxShadow = 'none';

  if (!pinColor) { 
    pinColor = isConnected ? '#4a4a4a' : '#2a2a2a'; 
  }

  if (isConnected) {
    borderColor = '#ff6b00'; 
    boxShadow = `0 0 6px ${borderColor}`;
  } else if (isSelected) {
    borderColor = '#ffffff'; 
    boxShadow = `0 0 8px ${borderColor}`;
    pinColor = pin.config.color ?? '#555555'; 
  } else if (isConnecting) {
    borderColor = '#facc15'; 
    boxShadow = `0 0 8px ${borderColor}`;
  } else if (isHovered) {
    borderColor = '#00ffff'; 
    boxShadow = `0 0 7px ${borderColor}`;
  }

  const style: CSSProperties = {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.max(8, PIN_SIZE * 0.4)}px`,
    fontWeight: 'bold',
    backgroundColor: pinColor,
    border: `2px solid ${borderColor}`,
    boxShadow: boxShadow,
    color: textColor,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    margin: `${PIN_MARGIN}px`,
  };

  return (
    <div
      key={pin.id}
      className="pin-wrapper"
      data-pin-pos={pin.index} 
      style={style}
      onClick={(e) => {
        e.stopPropagation(); 
        onClick(pin.index); 
      }}
    >
      {pin.number}
    </div>
  );
};

// Helper to determine pin display value based on numbering mode
// Note: This logic might need adjustments based on the full renderer implementation
// Currently simplified
const getPinDisplayValue = (
  pinIndex: number,
  totalPins: number,
  numberingMode: string | undefined 
): number | string => {
  // TODO: Implement proper numbering based on mode (sequential, row/col, etc.)
  return pinIndex + 1; 
};
````

## File: src/app/tools/wiremapper/components/ConnectorBuilder.tsx
````typescript
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
// Import necessary types and store
import {
  Connector,
  ConnectorShape,
  ConnectorConfig,
  ConnectorGender,
  Pin,
  PinConfig,
  DynamicConfigSchema
} from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore'; // Import the store
import { generateUniqueId } from '../utils/generateUniqueId';
import { ConnectorPreview } from '.';
import { DynamicConfigInput } from './DynamicConfigInput';
import { getAvailableShapes, getDefaultRenderer, getRenderer } from '../connectors/connectorRegistry';
import { CONNECTOR_DEFAULTS } from '../constants';

interface ConnectorBuilderProps {
  connectorToEdit: Connector | null;
  onComplete: () => void;
}

const GENDER_OPTIONS: ConnectorGender[] = ['Male', 'Female', 'Unknown'];

// Helper to get default config from schema
const getDefaultConfigFromSchema = (schema: DynamicConfigSchema): ConnectorConfig => {
  const defaultConfig: ConnectorConfig = {};
  for (const key in schema) {
    if (schema[key].defaultValue !== undefined) {
      defaultConfig[key] = schema[key].defaultValue;
    }
  }
  // Ensure basic properties exist if not in schema (though they should be)
  if (!('rows' in defaultConfig)) defaultConfig.rows = CONNECTOR_DEFAULTS.rows;
  if (!('columns' in defaultConfig)) defaultConfig.columns = CONNECTOR_DEFAULTS.cols;
  if (!('numPins' in defaultConfig)) defaultConfig.numPins = CONNECTOR_DEFAULTS.numPins;
  return defaultConfig;
};

export const ConnectorBuilder: React.FC<ConnectorBuilderProps> = ({ connectorToEdit, onComplete }) => {
  const isEditing = !!connectorToEdit;
  const defaultShape = useMemo(() => getDefaultRenderer().shape, []);
  // Get actions from the store
  const { addConnector, updateConnector } = useWireMapperStore();

  // --- Centralized State ---
  const [connectorState, setConnectorState] = useState<Partial<Connector>>(() => {
    if (isEditing && connectorToEdit) {
      // Ensure config is present when editing
      const config = connectorToEdit.config || {};
      // Make sure essential keys from potential schema mismatch are present
      if (!('rows' in config)) config.rows = CONNECTOR_DEFAULTS.rows;
      if (!('columns' in config)) config.columns = CONNECTOR_DEFAULTS.cols;
      if (!('numPins' in config)) config.numPins = CONNECTOR_DEFAULTS.numPins;
      return { ...connectorToEdit, config };
    }
    // Default for new connector
    const initialShape = defaultShape;
    const initialRenderer = getRenderer(initialShape);
    const initialSchema = initialRenderer?.getConfigurationSchema() ?? {};
    const initialConfig = getDefaultConfigFromSchema(initialSchema);
    return {
      id: generateUniqueId(),
      name: '',
      type: '',
      gender: 'Unknown',
      shape: initialShape,
      width: CONNECTOR_DEFAULTS.width,
      height: CONNECTOR_DEFAULTS.height,
      x: CONNECTOR_DEFAULTS.x,
      y: CONNECTOR_DEFAULTS.y,
      config: initialConfig,
    };
  });

  const [pins, setPins] = useState<Pin[]>(() => connectorToEdit?.pins ?? []); // Initialize pins if editing
  const [configSchema, setConfigSchema] = useState<DynamicConfigSchema>(() => {
    const initialRenderer = getRenderer(connectorState.shape ?? defaultShape);
    return initialRenderer?.getConfigurationSchema() ?? {};
  });

  // --- Effects ---

  // Update schema and config when shape changes
  useEffect(() => {
    const shape = connectorState.shape;
    if (!shape) return;

    const renderer = getRenderer(shape);
    if (!renderer) {
      console.error(`No renderer found for shape: ${shape}`);
      setConfigSchema({});
      setConnectorState(prev => ({ ...prev, config: {} }));
      return;
    }

    const newSchema = renderer.getConfigurationSchema();
    const newDefaultConfig = getDefaultConfigFromSchema(newSchema);

    setConfigSchema(newSchema);

    // Update config: Preserve existing values if keys match, otherwise use new defaults.
    // This handles both shape changes and initial load for editing.
    setConnectorState(prev => {
      const currentConfig = prev.config || {};
      const updatedConfig = { ...newDefaultConfig }; // Start with new defaults

      // Carry over values from previous config if the key exists in the new schema
      for (const key in newSchema) {
        if (key in currentConfig) {
          updatedConfig[key] = currentConfig[key];
        }
      }
      // Ensure essential keys like 'rows' or 'numPins' are present, using defaults if needed
      if (newSchema.rows && !('rows' in updatedConfig)) updatedConfig.rows = newDefaultConfig.rows;
      if (newSchema.columns && !('columns' in updatedConfig)) updatedConfig.columns = newDefaultConfig.columns;
      if (newSchema.numPins && !('numPins' in updatedConfig)) updatedConfig.numPins = newDefaultConfig.numPins;

      return { ...prev, config: updatedConfig };
    });

  }, [connectorState.shape]); // Rerun only when shape changes

  // Regenerate pins when config or dimensions change
  useEffect(() => {
    const shape = connectorState.shape;
    const config = connectorState.config;
    const width = connectorState.width ?? CONNECTOR_DEFAULTS.width;
    const height = connectorState.height ?? CONNECTOR_DEFAULTS.height;

    if (!shape || !config) return;

    const renderer = getRenderer(shape);
    if (!renderer) {
      setPins([]);
      return;
    }

    const dimensions = { width, height };

    try {
      const newPins = renderer.generatePins(config, dimensions);
      // Preserve active state and ID if pin index matches (more robust than ID match if IDs change)
      setPins(currentPins => {
        const currentPinMapByIndex = new Map(currentPins.map(p => [p.index, p]));
        return newPins.map(newPin => {
          const existingPin = currentPinMapByIndex.get(newPin.index);
          // Preserve active state, and keep original ID if it exists
          return {
            ...newPin,
            id: existingPin?.id ?? newPin.id, // Keep old ID if possible
            active: existingPin?.active ?? newPin.active // Preserve active state
          };
        });
      });
    } catch (error) {
      console.error("Error generating pins:", error);
      setPins([]);
    }
    // Only trigger when config content, shape, width, or height changes.
  }, [connectorState.config, connectorState.shape, connectorState.width, connectorState.height]);

  // --- Handlers ---

  const handleStateChange = useCallback(<K extends keyof Connector>(key: K, value: Connector[K]) => {
    setConnectorState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleConfigChange = useCallback((key: string, value: any) => {
    setConnectorState(prev => ({
      ...prev,
      config: {
        ...(prev.config ?? {}),
        [key]: value,
      }
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation (example)
    if (!connectorState.name?.trim()) {
      alert('Connector Name is required.');
      return;
    }
    if (!connectorState.shape) {
      alert('Connector Shape is required.');
      return;
    }

    // Extract rows/cols from config for top-level properties, default to 1 if not set
    const rows = connectorState.config?.rows ?? 1;
    const cols = connectorState.config?.cols ?? 1;

    const finalConnector: Omit<Connector, 'id'> & { id?: string } = {
      name: connectorState.name || 'Unnamed Connector',
      type: connectorState.type,
      gender: connectorState.gender || 'Unknown',
      shape: connectorState.shape,
      rows: rows, // Add top-level rows
      cols: cols, // Add top-level cols
      config: connectorState.config || {},
      pins: pins, // Use the latest generated pins state
      width: connectorState.width || CONNECTOR_DEFAULTS.width,
      height: connectorState.height || CONNECTOR_DEFAULTS.height,
      x: connectorState.x ?? CONNECTOR_DEFAULTS.x,
      y: connectorState.y ?? CONNECTOR_DEFAULTS.y,
      // Removed obsolete properties
    };

    console.log('Final Connector:', finalConnector);

    try {
      if (isEditing && connectorToEdit?.id) {
        // Update existing connector
        updateConnector(connectorToEdit.id, finalConnector as Partial<Connector>);
      } else {
        // Add new connector (casting away id for Omit type)
        addConnector(finalConnector as Omit<Connector, 'id'>);
      }
      onComplete(); // Close modal only after successful save
    } catch (error) {
      console.error("Error saving connector:", error);
      alert(`Failed to save connector: ${error instanceof Error ? error.message : String(error)}`);
      // Optionally, don't close the modal on error
      // onComplete(); 
    }
  };

  const handlePinToggle = useCallback((pinId: string) => {
    setPins(currentPins =>
      currentPins.map(pin =>
        pin.id === pinId ? { ...pin, active: !pin.active } : pin
      )
    );
  }, []); // Dependency: setPins

  // --- Derived State for Preview ---
  // Ensure required fields for preview are present before rendering
  const previewConnector = useMemo(() => {
    if (!connectorState.shape || !connectorState.config) {
      return null; // Indicate preview is not ready
    }
    return {
      // Provide defaults for potentially missing non-essential preview fields
      id: connectorState.id || 'preview-id',
      name: connectorState.name || 'Preview',
      type: connectorState.type,
      gender: connectorState.gender || 'Unknown',
      width: connectorState.width,
      height: connectorState.height,
      // Assert required fields are present based on the check above
      shape: connectorState.shape!,
      config: connectorState.config!,
      pins: pins,
    };
  }, [connectorState, pins]);

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">{isEditing ? 'Edit Connector' : 'Create New Connector'}</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="connectorName" className="block text-sm font-medium text-gray-400 mb-1">Connector Name</label>
          <input
            id="connectorName"
            type="text"
            value={connectorState.name || ''}
            onChange={(e) => handleStateChange('name', e.target.value)}
            placeholder="e.g., JST-XH Header"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="connectorType" className="block text-sm font-medium text-gray-400 mb-1">Connector Type (Optional)</label>
          <input
            id="connectorType"
            type="text"
            value={connectorState.type || ''}
            onChange={(e) => handleStateChange('type', e.target.value)}
            placeholder="e.g., Power Connector"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="connectorGender" className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
          <select
            id="connectorGender"
            value={connectorState.gender || 'Unknown'}
            onChange={(e) => handleStateChange('gender', e.target.value as ConnectorGender)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="connectorShape" className="block text-sm font-medium text-gray-400 mb-1">Shape</label>
          <select
            id="connectorShape"
            value={connectorState.shape || ''}
            onChange={(e) => handleStateChange('shape', e.target.value as ConnectorShape)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="" disabled>-- Select Shape --</option>
            {getAvailableShapes().map(shapeInfo => (
              <option key={shapeInfo.shape} value={shapeInfo.shape}>
                {shapeInfo.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Configuration & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Configuration Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">Configuration</h3>
          {configSchema && Object.keys(configSchema).length > 0 ? (
            Object.entries(configSchema).map(([key, option]) => {
              // Hide rows and columns inputs when pin pattern has a value
              if ((key === 'rows' || key === 'cols') &&
                connectorState.config?.pinPattern &&
                String(connectorState.config.pinPattern).trim() !== '') {
                return null;
              }

              return option ? (
                <DynamicConfigInput
                  key={key}
                  option={option} // Pass the individual option object
                  value={connectorState.config?.[key]}
                  onChange={handleConfigChange}
                />
              ) : null; // Handle case where an option might be undefined, though schema should be well-formed
            })
          ) : (
            <p className="text-gray-500 italic">Select a shape to see configuration options.</p>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6 md:col-span-3 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">Preview</h3>
          {/* Pass scale prop to make preview larger */}
          <ConnectorPreview
            connector={{
              ...(connectorState as Partial<Connector>),
              pins: pins, // Ensure pins are passed
              shape: connectorState.shape!, // Ensure shape is non-null
              config: connectorState.config!, // Ensure config is non-null
            }}
            scale={2.5} // Increase scale factor
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!previewConnector} // Disable save if preview isn't ready (shape/config missing)
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Save Changes' : 'Create Connector'}
        </button>
      </div>
    </form>
  );
};
````

## File: src/app/tools/wiremapper/components/ConnectorCanvas.tsx
````typescript
import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node as ReactFlowNode,
  Position,
  NodeChange,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow, // Added useReactFlow import
} from 'reactflow';
// Import ReactFlow styles first, then our custom styles will override them
import 'reactflow/dist/style.css';

import { useWireMapperStore } from '../store/useWireMapperStore';
import { ContextMenu } from './ContextMenu'; // Added import for new ContextMenu
import '../wiremapper.css';
import { Connector as ConnectorType, Pin, Mapping, WireMapperSettings, ContextMenuOption } from '../types'; // Added ContextMenuOption import
import type { PinIdentifier } from '../types';
import ConnectorNode from './ConnectorNode';

// Define the node types for React Flow
const nodeTypes = { connectorNode: ConnectorNode };

const ConnectorCanvas: React.FC = () => {
  const { 
    connectors, 
    mappings, 
    wires,
    settings, 
    focusedWireId,
    // connectingNodeId, // Removed: Not from store
    // connectionPreview, // Removed: Not from store
    removeConnector, // For context menu
    duplicateConnector, // For context menu
    addMapping, 
    updateMapping, 
    updateConnectorPosition, 
    setSelectedConnectorId, 
    setSelectedPin,
    setFocusedWireId,
  } = useWireMapperStore();

  // Ref for the flow container
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<ConnectorType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getEdges, screenToFlowPosition, getIntersectingNodes, project } = useReactFlow(); // Added getEdges

  // State for context menu
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; options: ContextMenuOption[]; nodeId: string } | null>(null);

  // Effect to transform store connectors into React Flow nodes
  useEffect(() => {
    const rfNodes: ReactFlowNode<ConnectorType>[] = connectors.map((connector) => ({
      id: connector.id,
      type: 'connectorNode',
      position: { x: connector.x || 0, y: connector.y || 0 },
      data: connector,
    }));
    setNodes(rfNodes);
  }, [connectors, setNodes]);

  // Effect to transform store mappings into React Flow edges
  useEffect(() => {
    const rfEdges: Edge[] = mappings.map((mapping) => ({
      id: mapping.id,
      source: mapping.source.connectorId,
      sourceHandle: `${mapping.source.pinPos}-handle`,
      target: mapping.target.connectorId,
      targetHandle: `${mapping.target.pinPos}-handle`,
      animated: settings.simplifyConnections ? false : true,
      style: mapping.color ? { stroke: mapping.color } : undefined,
      className: settings.simplifyConnections ? '' : 'animated',
      zIndex: 10,
    }));
    console.log('[Canvas] Mappings changed, attempting to set edges:', rfEdges);
    setEdges(rfEdges);
  }, [mappings, settings.simplifyConnections, setEdges]);

  // Callback to check if a connection is valid
  const isValidConnectionCheck = useCallback((connection: Connection) => {
    if (!connection.source || !connection.sourceHandle || !connection.target || !connection.targetHandle) {
      console.warn('[Canvas] isValidConnection: Incomplete connection data.', connection);
      return false;
    }

    const sourcePin = parseInt(connection.sourceHandle.split('-')[0], 10);
    const targetPin = parseInt(connection.targetHandle.split('-')[0], 10);

    if (connection.source === connection.target && sourcePin === targetPin) {
      console.log('[Canvas] isValidConnection: Self-connection attempt blocked for', connection);
      return false;
    }

    return true;
  }, []);

  // Callback when a new connection is made in React Flow
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('[Canvas] onConnect triggered:', connection);
      const sourcePin = connection.sourceHandle ? parseInt(connection.sourceHandle.split('-')[0], 10) : null;
      const targetPin = connection.targetHandle ? parseInt(connection.targetHandle.split('-')[0], 10) : null;

      if (connection.source && connection.target && sourcePin !== null && targetPin !== null) {
        const newMapping: Omit<Mapping, 'id' | 'wireId'> = {
          source: {
            connectorId: connection.source,
            pinPos: sourcePin,
          },
          target: {
            connectorId: connection.target,
            pinPos: targetPin,
          },
        };
        console.log('[Canvas] Calling addMapping with structured object:', newMapping);
        addMapping(newMapping);
      } else {
        console.error('[Canvas] onConnect failed: Invalid connection data received after isValidConnection check.', connection);
      }
    },
    [addMapping]
  );

  // Callback when a node stops dragging
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      updateConnectorPosition(node.id, node.position.x, node.position.y);
    },
    [updateConnectorPosition]
  );

  // Callback when a node is clicked
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      console.log('!!!!!! [Canvas] Node clicked EVENT FIRED:', node.id);
      setSelectedConnectorId(node.id);
      setSelectedPin(null, null);
    },
    [setSelectedConnectorId, setSelectedPin]
  );

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    console.log('!!!!!! [Canvas] PANE CLICKED EVENT FIRED', event);
    // Clear selections when clicking on the background
    setSelectedConnectorId(null);
    setSelectedPin(null, null);
    setFocusedWireId(null); // Clear focused wire to show all wires
    
    // Also clear copied net when clicking on empty area to exit paste mode
    const state = useWireMapperStore.getState();
    if (state.copiedNet) {
      state.setCopiedNet(null);
    }
    
    closeContextMenu(); // Close context menu if open
  }, [setSelectedConnectorId, setSelectedPin, setFocusedWireId]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Since we're using createPortal to render to document.body, use client coordinates
      const menuX = event.clientX;
      const menuY = event.clientY;

      console.log(`[Canvas] Node context menu for: ${node.id} at (${menuX}, ${menuY})`);

      const options: ContextMenuOption[] = [
        {
          label: `Duplicate '${node.data.name || node.id}'`,
          action: () => {
            duplicateConnector(node.id);
            closeContextMenu();
          },
        },
        {
          label: `Delete '${node.data.name || node.id}'`,
          action: () => {
            // removeConnector in the store already handles removing associated mappings and wires
            removeConnector(node.id);
            closeContextMenu();
          },
          danger: true,
        },
        // TODO: Add 'Properties' option later if needed
        // { label: 'Properties', action: () => { console.log(`Properties for node: ${node.id}`); closeContextMenu(); } },
      ];

      setContextMenuState({
        x: menuX,
        y: menuY,
        nodeId: node.id,
        options,
      });
    },
    [duplicateConnector, removeConnector, getEdges] // Removed storeRemoveEdges, added getEdges
  );

  const closeContextMenu = () => {
    setContextMenuState(null);
  };

  // Filter edges based on focused wire ID
  const visibleEdges = (() => {
    if (!settings.showWires) return []; // Don't show any wires if showWires is false
    
    if (focusedWireId) {
      // Debug log to see what's happening with the filtering
      console.log(`Filtering edges for wireId: ${focusedWireId}`);
      console.log('Available edges:', edges.map(e => ({ id: e.id, wireId: e.data?.wireId })));
      
      // If a wire is focused, only show edges with that wireId
      const filtered = edges.filter(edge => edge.data?.wireId === focusedWireId);
      console.log('Filtered edges:', filtered.length);
      
      // If no edges match the wireId, it might be stored differently
      // Try using the mapping ID instead (as a fallback)
      if (filtered.length === 0) {
        console.log('No edges found with wireId, trying to match by mapping ID');
        return edges.filter(edge => {
          // Try to match by id which might be the mapping id
          return edge.id.includes(focusedWireId) || 
                (edge.data && edge.data.id === focusedWireId);
        });
      }
      
      return filtered;
    }
    
    // Otherwise show all edges
    return edges;
  })();

  // Add CSS to make edges non-interactive and handle global right-click events
  useEffect(() => {
    // Add a style element to the document head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .react-flow__edge {
        pointer-events: none !important;
      }
      .react-flow__edge-path {
        pointer-events: none !important;
      }
      .react-flow__connection-path {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // We've removed the global right-click handler since it was causing duplicate context menus
    // The original context menu in ConnectorNode.tsx will handle pin right-clicks
    
    // Cleanup function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div 
      ref={flowContainerRef} // Attach ref here
      className="relative w-full h-full bg-gray-800 overflow-hidden cursor-default rounded-md wire-mapper-flow-container"
      onContextMenuCapture={(event) => event.preventDefault()} // Use capturing phase on the container
    >
      <ReactFlow
        nodes={nodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnectionCheck}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeContextMenu={handleNodeContextMenu} // Assign the new handler
        onPaneClick={handlePaneClick} // Added for testing pane clicks
        nodeTypes={nodeTypes}
        elementsSelectable={true} // Explicitly set
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{
          stroke: 'var(--accent-primary)',
          strokeWidth: 2,
          opacity: 0.7,
        }}
        edgesFocusable={false} // Make edges not focusable
        edgesUpdatable={false} // Make edges not updatable
        fitView
        snapToGrid={settings.snapToGrid}
        snapGrid={[settings.gridSize || 20, settings.gridSize || 20]}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-800 wire-mapper-flow"
      >
        <Controls
          position="bottom-left"
          showZoom={true}
          showFitView={true}
        />
        
        {/* Focused Wire Indicator */}
        {focusedWireId && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm">
            <span>Showing only selected connection</span>
            <button 
              onClick={() => setFocusedWireId(null)}
              className="text-green-400 hover:text-green-300 text-xs bg-gray-800 px-2 py-1 rounded"
            >
              Show All
            </button>
          </div>
        )}
        
        <Controls
          showInteractive={false}
          className="minimal-controls"
        />
        {settings.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={settings.gridSize || 20}
            size={1.5}
            color="#627287"
          />
        )}
      </ReactFlow>
      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          options={contextMenuState.options}
          onClose={closeContextMenu}
          containerRef={flowContainerRef} // Pass the container ref
        />
      )}
    </div>
  );
};

export default ConnectorCanvas;
````

## File: src/app/tools/wiremapper/components/ConnectorDetail.tsx
````typescript
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Connector, ConnectorGender } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { debounce } from 'lodash';

interface ConnectorDetailProps {
  connector: Connector;
  onEdit: () => void; // Callback when the 'Edit in Builder' button is clicked
}

interface LocalConnectorData extends Partial<Connector> {
  // We can add more specific local state if needed, but Partial<Connector> is a good start
}

export const ConnectorDetail: React.FC<ConnectorDetailProps> = ({ connector, onEdit }) => {
  const { updateConnector } = useWireMapperStore();
  const [localData, setLocalData] = useState<LocalConnectorData | null>(null);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  useEffect(() => {
    if (!connector) {
      setLocalData(null);
      setIsLayoutLocked(false);
      return;
    }

    const hasConnections = connector.pins.some(pin => pin.connectedWireIds && pin.connectedWireIds.length > 0);
    setIsLayoutLocked(hasConnections);

    if (!localData || localData.id !== connector.id) {
      // Different connector selected or initial load for this connector
      setLocalData({
        ...connector,
        config: connector.config ? { ...JSON.parse(JSON.stringify(connector.config)) } : {},
      });
    } else {
      // Same connector, but its data might have updated in the store. Merge carefully.
      const activeElement = document.activeElement as HTMLElement;
      const focusedInputName = (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) 
                              ? (activeElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).name 
                              : null;

      let newLocalData = { ...localData };
      let needsUpdate = false;

      // Sync top-level editable properties
      const fieldsToSync: (keyof Connector)[] = ['name', 'type', 'gender', 'rows', 'cols'];
      fieldsToSync.forEach(field => {
        if (field === 'config' || field === 'pins' || field === 'id' || field === 'x' || field === 'y') return; // these are handled differently or not directly editable here
        
        const storeValue = connector[field as keyof Connector];
        const localValue = localData[field as keyof Connector];
        
        // Normalize undefined/null to empty string for comparison for some fields, or handle types appropriately
        const normalizedStoreValue = storeValue === undefined || storeValue === null ? "" : storeValue;
        const normalizedLocalValue = localValue === undefined || localValue === null ? "" : localValue;

        if (String(normalizedStoreValue) !== String(normalizedLocalValue)) { // Compare as strings for simplicity here, refine if type issues arise
          if (focusedInputName !== field) { 
            // @ts-ignore
            newLocalData[field] = connector[field];
            needsUpdate = true;
          }
        }
      });

      // Sync config properties (example: centerPinsHorizontal)
      if (connector.config && localData.config) {
        const configKeysToSync = ['centerPinsHorizontal']; // Add other editable config keys here
        configKeysToSync.forEach(configKey => {
          const storeConfigValue = connector.config![configKey];
          const localConfigValue = localData.config![configKey];
          if (storeConfigValue !== localConfigValue) {
            if (focusedInputName !== configKey) {
              newLocalData.config = { ...newLocalData.config, [configKey]: storeConfigValue };
              needsUpdate = true;
            }
          }
        });
      }

      if (needsUpdate) {
        setLocalData(newLocalData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]); // localData is intentionally omitted to prevent cycles, logic handles merging.

  const debouncedUpdateConnector = useCallback(
    debounce((id: string, updates: Partial<Connector>) => {
      updateConnector(id, updates);
    }, 500),
    [updateConnector]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!localData || !connector) return;
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'number') {
      parsedValue = parseFloat(value); // Use parseFloat for potentially decimal values
      if (isNaN(parsedValue as number)) {
        // Handle non-numeric input for number fields, e.g., revert or set to a default valid value
        // For now, we'll let it be NaN and expect validation/handling before store update if necessary
        // or rely on min/max attributes of the input field.
        // If the field should not be NaN, you might set it to localData[keys[0]] to revert, or 0, or null.
        // For controlled components, usually you'd prevent invalid chars or show validation message.
      } 
    }
    if (e.target.type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    }

    const keys = name.split('.');
    let updatedData = { ...localData };

    if (keys.length > 1 && keys[0] === 'config' && updatedData.config) {
      updatedData.config = { ...updatedData.config, [keys[1]]: parsedValue };
    } else {
      updatedData = { ...updatedData, [keys[0]]: parsedValue };
    }
    
    setLocalData(updatedData);
    debouncedUpdateConnector(connector.id, { [keys[0]]: parsedValue });
  };
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!localData || !connector || !localData.config) return;
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'number') {
        parsedValue = parseInt(value, 10); // Config values like rows/cols are likely integers
        if (isNaN(parsedValue as number)) { 
            // Similar handling for NaN as in handleChange
        }
    }
    if (type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    }

    const updatedConfig = { ...localData.config, [name]: parsedValue };
    setLocalData({ ...localData, config: updatedConfig });
    debouncedUpdateConnector(connector.id, { config: updatedConfig });
  };


  if (!localData || !connector) {
    return <p className="text-gray-500">No connector selected or data loaded.</p>;
  }

  const inputClass = "w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300 focus:ring-1 focus:ring-green-500 focus:border-green-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";
  const disabledInputClass = `${inputClass} bg-gray-700 cursor-not-allowed opacity-70`;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="connectorName" className={labelClass}>Name</label>
        <input
          type="text"
          id="connectorName"
          name="name"
          value={localData.name || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="connectorType" className={labelClass}>Type (e.g., DB9, JST-XH)</label>
        <input
          type="text"
          id="connectorType"
          name="type"
          value={localData.type || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="connectorGender" className={labelClass}>Gender</label>
        <select 
          id="connectorGender" 
          name="gender" 
          value={localData.gender || 'Unknown'}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-md font-semibold text-green-500 mb-2">Layout Configuration</h4>
        {isLayoutLocked && (
            <p className="text-xs text-yellow-400 bg-yellow-900/50 p-2 rounded mb-3">
                Layout properties (rows, columns, etc.) are locked because this connector has active wire connections. To modify layout, please remove all wires first or use the 'Edit in Builder' option which may re-generate pins.
            </p>
        )}
        <div>
          <label htmlFor="connectorRows" className={labelClass}>Rows</label>
          <input
            type="number"
            id="connectorRows"
            name="rows"
            value={localData.rows || ''}
            onChange={handleChange}
            className={isLayoutLocked ? disabledInputClass : inputClass}
            disabled={isLayoutLocked}
            min="1"
          />
        </div>
        <div>
          <label htmlFor="connectorCols" className={labelClass}>Columns</label>
          <input
            type="number"
            id="connectorCols"
            name="cols"
            value={localData.cols || ''}
            onChange={handleChange}
            className={isLayoutLocked ? disabledInputClass : inputClass}
            disabled={isLayoutLocked}
            min="1"
          />
        </div>
         {/* Example for a boolean config option */}
        {localData.config && typeof localData.config.centerPinsHorizontal === 'boolean' && (
            <div>
            <label htmlFor="centerPinsHorizontal" className={`${labelClass} mt-2 flex items-center`}>
                <input
                type="checkbox"
                id="centerPinsHorizontal"
                name="centerPinsHorizontal" // This name is for the config object
                checked={localData.config.centerPinsHorizontal ?? false}
                onChange={handleConfigChange} // Use handleConfigChange for config properties
                className={`mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 ${isLayoutLocked ? 'cursor-not-allowed' : ''}`}
                disabled={isLayoutLocked}
                />
                Center Pins Horizontally
            </label>
            </div>
        )}
      </div>

      {/* Add more fields for other ConnectorConfig properties as needed */}
      {/* For dynamic config from a schema, we would iterate and generate fields here */}

      <div className="mt-6 border-t border-gray-700 pt-4">
        <button 
          onClick={onEdit} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Edit in Builder (Advanced)
        </button>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/ConnectorNode.tsx
````typescript
import React, { memo, useState, useMemo, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from 'reactflow';
import { Connector, Pin, ContextMenuOption } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore'; 
import { PIN_SIZE, PIN_MARGIN, CONNECTOR_PADDING } from '../constants';
import { PinDisplay } from './PinDisplay'; 
import { ContextMenu } from './ContextMenu';
import '../wiremapper.css'; // Import the CSS file

const ConnectorNode: React.FC<NodeProps<Connector>> = ({ data, id, selected }) => {
  // Use default rows/cols from data, but calculate dimensions based on them
  const { name, rows = 1, cols = 1, pins: allPins = [], config = {}, shape, gender, type } = data;
  const selectedPin = useWireMapperStore(state => state.selectedPin);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const centerPins = config.centerPinsHorizontally ?? false; // Default to false if not set
  const nodeRef = useRef<HTMLDivElement>(null);
  const reactFlow = useReactFlow();

  // Store actions and state for pin context menu
  const { 
    copyNetFromPin: storeCopyNetFromPin,
    pasteNetToPin: storePasteNetToPin,
    resetPin: storeResetPin,
    copiedNet 
  } = useWireMapperStore();

  const [pinContextMenuState, setPinContextMenuState] = useState<{ x: number; y: number; pinPos: number; options: ContextMenuOption[] } | null>(null);

  const isPinConnected = useWireMapperStore(state => state.isPinConnected);
  const settings = useWireMapperStore(state => state.settings);
  const setSelectedPin = useWireMapperStore((state) => state.setSelectedPin);
  const setSelectedConnectorId = useWireMapperStore((state) => state.setSelectedConnectorId);

  const handlePinClick = (pinPos: number) => {
    console.log(`[Node ${id}] Pin ${pinPos} clicked`);
    setSelectedPin(id, pinPos); 
  };
  
  const handlePinContextMenu = useCallback((e: React.MouseEvent, pinPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Since we're using createPortal to render to document.body, we need client coordinates
    // These are already relative to the viewport/document
    const menuX = e.clientX;
    const menuY = e.clientY;
    
    console.log(`[Node:${id}] Pin ${pinPos} context menu opening at (${menuX}, ${menuY})`);

    const options: ContextMenuOption[] = [
      {
        label: 'Copy Net',
        action: () => {
          storeCopyNetFromPin(id, pinPos);
          closePinContextMenu();
        },
      },
      {
        label: `Paste Net ${copiedNet ? `(${copiedNet.netName || 'Unnamed Net'})` : ''}`,
        action: () => {
          storePasteNetToPin(id, pinPos);
          closePinContextMenu();
        },
        disabled: !copiedNet,
      },
      { label: 'Reset Pin', action: () => { storeResetPin(id, pinPos); closePinContextMenu(); }, danger: true },
    ];

    setPinContextMenuState({ x: menuX, y: menuY, pinPos, options });
  }, [id, storeCopyNetFromPin, storePasteNetToPin, storeResetPin, copiedNet]);

  const closePinContextMenu = useCallback(() => {
    setPinContextMenuState(null);
  }, []);

  const handleConnectorClick = (e: React.MouseEvent) => {
    // Stop event from propagating to prevent double-handling
    e.stopPropagation();
    
    // Set the selected connector ID in the store
    console.log('ConnectorNode direct click handler fired for:', id);
    setSelectedConnectorId(id);
  };

  console.log('ConnectorNode:', id, 'data props -> rows:', rows, 'cols:', cols, 'name:', name);
  console.log('ConnectorNode:', id, 'allPins:', JSON.parse(JSON.stringify(allPins)));
  const visiblePins = allPins.filter(pin => pin.visible !== false);
  console.log('ConnectorNode:', id, 'visiblePins:', JSON.parse(JSON.stringify(visiblePins)));

  const pinsByRow = useMemo(() => {
    const grouped: { [key: number]: Pin[] } = {};
    visiblePins.forEach((pin) => {
      // Ensure pin.row is defined before using as index
      if (pin.row !== undefined) {
        if (!grouped[pin.row]) {
          grouped[pin.row] = [];
        }
        grouped[pin.row].push(pin);
        // Sort pins within the row by column index for consistent order
        // Ensure pin.col is defined for sorting, default to 0 if not
        grouped[pin.row].sort((a: Pin, b: Pin) => (a.col ?? 0) - (b.col ?? 0));
      }
    });
    console.log(`ConnectorNode: ${id} visiblePins (grouped by row):`, grouped);
    return grouped;
  }, [visiblePins, id]);

  // --- Calculate Dynamic Dimensions --- 
  const calculatedWidth = useMemo(() => {
    const gridWidth = (cols * PIN_SIZE) + Math.max(0, cols - 1) * (PIN_MARGIN * 2);
    return gridWidth + (CONNECTOR_PADDING * 2); 
  }, [cols]);

  const calculatedHeight = useMemo(() => {
    const gridHeight = (rows * PIN_SIZE) + Math.max(0, rows - 1) * (PIN_MARGIN * 2);
    const nameHeight = name ? 30 : 0; // Estimate space for the name label + its padding
    return gridHeight + (CONNECTOR_PADDING * 2) + nameHeight; 
  }, [rows, name]);
  // ---------------------------------

  // Debug log for dimensions
  console.log(`[ConnectorNode ${id}] data.rows=${data.rows}, data.cols=${data.cols}, calcWidth=${calculatedWidth}, calcHeight=${calculatedHeight}`);

  return (
    <>
      {pinContextMenuState && (
        <ContextMenu
          x={pinContextMenuState.x}
          y={pinContextMenuState.y}
          options={pinContextMenuState.options}
          onClose={closePinContextMenu}
          // We might need to pass a containerRef here if sub-menus are inside ReactFlow pane
        />
      )}
      <div
        className={`connector-node ${selected ? 'selected' : ''} dark-theme`}
        style={{
          width: `${calculatedWidth}px`,
          height: `${calculatedHeight}px`,
        }}
        onClick={handleConnectorClick} // Add direct click handler
      >
      {name && (
        <div
          className="connector-drag-handle" 
          style={{ padding: `${CONNECTOR_PADDING / 2}px ${CONNECTOR_PADDING}px 0 ${CONNECTOR_PADDING}px` }} // Only keep dynamic padding
        >
          {name}
        </div>
      )}

      {/* Pin Grid Container */}
      <div 
        className="connector-pin-grid"
        style={{
          display: 'grid', // Keep layout styles
          gridTemplateColumns: `repeat(${cols}, ${PIN_SIZE}px)`, // Dynamic
          gridTemplateRows: `repeat(${rows}, ${PIN_SIZE}px)`,   // Dynamic
          gap: `${PIN_MARGIN * 2}px`,                         // Dynamic
          padding: `${CONNECTOR_PADDING}px`,                   // Dynamic
          // Removed: alignContent, justifyContent, flexGrow, boxSizing (moved to CSS)
        }}
      >
        {centerPins
          ? // --- Method 1: Center pins using flexbox within each row --- 
            Object.entries(pinsByRow).map(([rowIndex, pinsInRow]) => (
              <div
                key={`row-${rowIndex}`}
                className="pin-row-container"
                style={{
                  gridRow: `${parseInt(rowIndex, 10) + 1}`,
                  gridColumn: `1 / -1`, // Span all columns
                  display: 'flex',
                  justifyContent: 'center', // Center pins horizontally
                  alignItems: 'center',     // Center pins vertically within row space
                  gap: '4px', // Adjust gap as needed between pins in the row
                }}
              >
                {pinsInRow.map((pin) => (
                  <PinDisplay
                    key={pin.id}
                    pin={pin}
                    isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                    isHovered={hoveredPin === pin.pos} // Pass hoveredPin state
                    isConnected={isPinConnected(pin.pos, id)}
                    darkMode={settings.darkMode ?? true}
                    gender={gender as 'male' | 'female'}
                    onClick={() => handlePinClick(pin.pos)}
                    onContextMenu={(e) => handlePinContextMenu(e, pin.pos)} // Passed to PinDisplay
                    onMouseEnter={() => setHoveredPin(pin.pos)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <Handle
                      type="source" 
                      position={Position.Top} 
                      id={`${pin.pos}-handle`} 
                      style={{
                        width: '1px', 
                        height: '1px',
                        background: 'transparent', 
                        border: 'none',
                        position: 'absolute',
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 20, 
                      }}
                      isConnectable={true}
                    />
                  </PinDisplay>
                ))}
              </div>
            ))
          : // --- Method 2: Place pins directly onto the grid (original behavior) ---
            visiblePins.map(pin => {
              if (pin.row === undefined || pin.col === undefined) {
                console.warn(`Pin ${pin.pos} in connector ${id} is missing row/col data.`);
                return null; 
              }
              console.log('ConnectorNode:', id, 'Rendering Pin:', pin.pos, 'at row:', pin.row, 'col:', pin.col);
              return (
                <div 
                  key={`pin-grid-${pin.pos}`} 
                  style={{
                    gridRowStart: pin.row + 1, 
                    gridColumnStart: pin.col + 1,
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PinDisplay
                    pin={pin}
                    isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                    isHovered={hoveredPin === pin.pos}
                    isConnected={isPinConnected(pin.pos, id)}
                    darkMode={settings.darkMode}
                    gender={gender?.toLowerCase() === 'female' ? 'female' : 'male'}
                    onClick={handlePinClick}
                    onContextMenu={(e) => handlePinContextMenu(e, pin.pos)} // Passed to PinDisplay
                    onMouseEnter={setHoveredPin}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <Handle
                      type="source" 
                      position={Position.Top} 
                      id={`${pin.pos}-handle`} 
                      style={{
                        width: '1px', 
                        height: '1px',
                        background: 'transparent', 
                        border: 'none',
                        position: 'absolute',
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 20, 
                      }}
                      isConnectable={true}
                    />
                  </PinDisplay>
                </div>
              );
            })}
      </div>
    </div>
    </>
  );
};

export default memo(ConnectorNode);
````

## File: src/app/tools/wiremapper/components/ConnectorPreview.tsx
````typescript
import React from 'react';
import { Connector, Pin, ConnectorConfig, ConnectorShape } from '../types';
import { getRenderer } from '../connectors/connectorRegistry';
import { CONNECTOR_DEFAULTS } from '../constants';

// Define theme colors (replace with actual theme variables if available)
const THEME_COLORS = {
  background: '#1a202c', // Dark background
  accent: '#00ff9d',    // Green accent
  pinFill: '#374151',     // Mid-gray for pin body
  textLight: '#E2E8F0',   // Light text for contrast
  textDark: '#1A202C',    // Dark text (for light backgrounds, if needed)
  textSubtle: '#94a3b8',  // Subtle gray text
  border: '#475569',     // Border color
};

export interface ConnectorPreviewProps {
  connector: Partial<Pick<Connector, 'id' | 'name' | 'type' | 'gender' | 'shape' | 'width' | 'height' | 'config'>> & {
    pins: Pin[];
    shape: ConnectorShape;
    config: ConnectorConfig;
  };
  scale?: number;
  onPinClick?: (pinId: string) => void;
}

const PIN_RADIUS = 4;

export const ConnectorPreview: React.FC<ConnectorPreviewProps> = ({ connector, scale = 1, onPinClick }) => {
  const renderer = getRenderer(connector.shape);

  if (!renderer) {
    return <div className="text-red-500">Error: Renderer not found for shape {connector.shape}</div>;
  }

  const pins = connector.pins;
  const config = connector.config || {};

  // --- Calculate pin bounds for dynamic padding ---
  const scaledPinRadius = PIN_RADIUS * scale;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pins.forEach(pin => {
    if (typeof pin.x === 'number' && typeof pin.y === 'number') {
      minX = Math.min(minX, pin.x);
      minY = Math.min(minY, pin.y);
      maxX = Math.max(maxX, pin.x);
      maxY = Math.max(maxY, pin.y);
    }
  });
  // Add padding so pins are never clipped
  // Reduce vertical padding for compact rows
  const padX = Math.max(scaledPinRadius * 2, 16 * scale);
  const padY = Math.max(scaledPinRadius * 1.1, 8 * scale); // Less vertical pad than horizontal
  // If pins are not defined, fallback to connector dimensions
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    minX = 0; minY = 0;
    maxX = (connector.width ?? CONNECTOR_DEFAULTS.width) * scale;
    maxY = (connector.height ?? CONNECTOR_DEFAULTS.height) * scale;
  }
  const svgMinX = Math.floor(minX - padX);
  const svgMinY = Math.floor(minY - padY);
  const svgMaxX = Math.ceil(maxX + padX);
  const svgMaxY = Math.ceil(maxY + padY);
  const width = svgMaxX - svgMinX;
  const height = svgMaxY - svgMinY;
  const viewBox = `${svgMinX} ${svgMinY} ${width} ${height}`;

  // Connector Base Component (adjust styling here)
  const ConnectorBase = () => {
    if (connector.shape === 'Circle') {
      // Approximate center based on calculated viewbox
      const centerX = svgMinX + width / 2;
      const centerY = svgMinY + height / 2;
      const radius = Math.min(width, height) / 2 - (1 * scale); // Adjust radius slightly for stroke

      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={THEME_COLORS.background} // Dark background
          stroke={THEME_COLORS.accent}   // Green accent stroke
          strokeWidth={1.5 * scale}
        />
      );
    } else {
      // Rectangle connector: use calculated viewbox coords/dims
      return (
        <rect
          x={svgMinX}
          y={svgMinY}
          width={width}
          height={height}
          rx={5 * scale} // Smaller radius for subtle rounding
          ry={5 * scale}
          fill={THEME_COLORS.background} // Dark background
          stroke={THEME_COLORS.accent}   // Green accent stroke
          strokeWidth={1.5 * scale}
        />
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Removed bg-gray-700 from SVG, using ConnectorBase fill instead */}
      <svg width={width} height={height} viewBox={viewBox} className="rounded overflow-hidden border border-[${THEME_COLORS.border}]">
        <ConnectorBase />
        {pins.map((pin) => {
          // Use precomputed pin.x and pin.y from generatePins
          if (typeof pin.x !== 'number' || typeof pin.y !== 'number') return null;

          const pinIsActive = pin.active ?? true;

          return (
            <g
              key={pin.id || pin.index}
              transform={`translate(${pin.x}, ${pin.y})`}
              opacity={pinIsActive ? 1 : 0.4}
              onClick={(e) => {
                e.stopPropagation();
                if (pin.id) {
                  onPinClick?.(pin.id);
                }
              }}
              className={onPinClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
            >
              <circle
                cx="0"
                cy="0"
                r={scaledPinRadius}
                fill={THEME_COLORS.pinFill}      // Updated pin fill
                stroke={THEME_COLORS.accent}    // Green accent stroke
                strokeWidth={0.7 * scale}       // Slightly thinner pin stroke
                // Optional: Add subtle glow back if desired
                // style={{ filter: `drop-shadow(0 0 ${2 * scale}px ${THEME_COLORS.accent})` }}
              />
              {/* Pin number in light color for contrast */}
              <text
                x="0"
                y="0"
                dy=".3em"
                textAnchor="middle"
                fontSize={scaledPinRadius * 0.9}
                fill={THEME_COLORS.textLight}   // Updated text color
                fontWeight="bold"
                fontFamily='monospace'         // Use monospace for consistency
                className="pointer-events-none select-none"
              >
                {pin.number}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Updated text styling below preview */}
      <div className="text-xs text-center mt-2 text-[${THEME_COLORS.textSubtle}] font-mono">
        <p className="text-[${THEME_COLORS.textLight}] font-semibold">{connector.name || 'Unnamed Preview'}</p>
        <p>{pins.length} pin / {connector.gender || 'Unknown'}</p>
        <p>Shape: {connector.shape}</p>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/ConnectorRenderer.tsx
````typescript
import React from 'react';
import { Pin, ConnectorGender } from '../types'; // Assuming Pin type is needed

// Define props for the renderer
interface ConnectorRendererProps {
  rows: number;
  cols: number;
  pins: Pin[]; // Use the Pin type from types/index.ts
  gender: ConnectorGender;
  centerPins?: boolean;
  pinNumberingMode?: 'continue' | 'skip'; // Primarily for builder preview
  pinSize?: number; // Allow overriding pin size
  name?: string; // Optional: For displaying name inside the connector (like preview)
  renderPinContent?: (pinData: { displayValue: number | string, pin: Pin }) => React.ReactNode; // Allow custom pin content
  getRowStyle?: (rowIndex: number) => React.CSSProperties;
  getPinStyle?: (pinData: { displayValue: number | string, pin: Pin }) => React.CSSProperties;
  pinWrapperClassName?: string; 
}

const DEFAULT_PIN_SIZE = 20;

export const ConnectorRenderer: React.FC<ConnectorRendererProps> = ({
  rows,
  cols,
  pins, // Should be the full layout including invisible pins if available
  gender,
  centerPins = false,
  pinNumberingMode = 'skip', // Default to 'skip' as actual connectors use original numbers
  pinSize = DEFAULT_PIN_SIZE,
  name,
  renderPinContent,
  getRowStyle,
  getPinStyle,
  pinWrapperClassName
}) => {

  // --- Core Rendering Logic (To be moved from ConnectorBuilder Preview) ---
  const renderPinsLayout = () => {
    const pinLayout = pins; // Use the passed pins
    const visiblePins = pinLayout.filter(p => p.visible !== false); // Assume visible if undefined
    const pinsByRow: { [key: number]: { pin: Pin, displayValue: number | string }[] } = {};
    let visiblePinIndex = 0;

    // Group visible pins by row and calculate display value
    pinLayout.forEach((pin) => {
      // Determine row/col. Fallback to grid calculation if row/col missing (shouldn't happen with builder data)
      const pinRow = pin.row ?? Math.floor((pin.pos - 1) / cols);
      const pinCol = pin.col ?? (pin.pos - 1) % cols;

      if (pin.visible === false) return; // Skip invisible pins

      if (pinsByRow[pinRow] === undefined) {
        pinsByRow[pinRow] = [];
      }
      // Calculate display value based on mode (primarily for preview)
      const displayValue = pinNumberingMode === 'continue' ? ++visiblePinIndex : pin.pos;
      pinsByRow[pinRow].push({ pin: { ...pin, row: pinRow, col: pinCol }, displayValue });
    });

    // Render rows
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const rowPins = pinsByRow[rowIndex] || [];
      if (rowPins.length === 0) return null; // Don't render empty rows

      // Sort pins in the row by their original column index for consistent order
      rowPins.sort((a, b) => (a.pin.col ?? 0) - (b.pin.col ?? 0));

      const defaultRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: `${pinSize / 2}px`, // Default gap, can be overridden
        justifyContent: centerPins ? 'center' : 'flex-start',
        width: '100%',
        minHeight: `${pinSize}px`, // Base height
        marginBottom: '4px',
      };

      const calculatedRowStyle = getRowStyle ? getRowStyle(rowIndex) : defaultRowStyle;

      return (
        <div 
          key={`render-row-${rowIndex}`}
          style={calculatedRowStyle}
        >
          {rowPins.map(({ pin, displayValue }) => {
            const defaultPinStyle: React.CSSProperties = {
              width: pinSize,
              height: pinSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.max(8, pinSize * 0.4)}px`, // Scale font size
              fontWeight: 'bold',
              backgroundColor: gender === 'Female' ? '#111111' : '#333333', // Default colors
              border: `2px solid #00ff9d`,
              boxShadow: `0 0 4px #00ff9d`,
              color: '#e0e0e0',
              margin: '2px 0', // Minimal vertical margin
            };

            const calculatedPinStyle = getPinStyle ? getPinStyle({ displayValue, pin }) : defaultPinStyle;
            
            const pinContent = renderPinContent 
              ? renderPinContent({ displayValue, pin }) 
              : <span>{displayValue}</span>;

            return (
              <div
                key={`render-pin-${pin.pos}`}
                style={calculatedPinStyle}
                className={pinWrapperClassName} // Allow adding classes for hover etc.
                data-pin-pos={String(pin.pos)} // Ensure data attribute value is a string
              >
                {pinContent}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // --- Main Return --- 
  return (
    <div className="flex flex-col items-center w-full">
      {name && (
        <div className="text-green-400 font-mono text-xs mb-2 text-center font-bold">
          {name}
        </div>
      )}
      <div className="flex flex-col w-full">
        {renderPinsLayout()}
      </div>
    </div>
  );
};

// Optional: Export default if it's the primary export
// export default ConnectorRenderer;
````

## File: src/app/tools/wiremapper/components/context-menu.css
````css
.context-menu-container {
  position: absolute;
  z-index: 1000; /* High z-index to appear above other elements */
  background-color: #1a202c; /* Dark background - consistent with dark theme */
  border: 1px solid #2d3748; /* Slightly lighter border */
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 180px; /* Minimum width for the menu */
  padding: 4px 0; /* Vertical padding for the list */
  font-family: 'Roboto Mono', monospace; /* Terminal-like font */
}

.context-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu-option {
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 8px 16px; /* Padding for each option */
  font-size: 0.875rem; /* 14px */
  color: #a0aec0; /* Lighter gray text */
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.context-menu-option:hover:not(.disabled) {
  background-color: #2d3748; /* Slightly lighter dark for hover */
  color: #00ff9d; /* Green accent on hover */
}

.context-menu-option.danger {
  color: #f56565; /* Red for danger options */
}

.context-menu-option.danger:hover:not(.disabled) {
  background-color: #3b3030; /* Darker red background on hover */
  color: #f56565; /* Keep red text color */
}

.context-menu-option.disabled {
  color: #4a5568; /* Muted color for disabled options */
  cursor: not-allowed;
}

.context-menu-option.disabled:hover {
  background-color: transparent; /* No background change on hover for disabled */
  color: #4a5568; /* Keep muted color */
}
````

## File: src/app/tools/wiremapper/components/ContextMenu.tsx
````typescript
'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuOption } from '../types';
import './context-menu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
  // Optional: To adjust menu position if it overflows viewport
  // We can add more sophisticated viewport collision detection later if needed
  containerRef?: React.RefObject<HTMLElement | null>; 
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose, containerRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  let adjustedX = x;
  let adjustedY = y;

  // Basic viewport collision adjustment
  if (menuRef.current) {
    const menuRect = menuRef.current.getBoundingClientRect();
    const container = containerRef?.current ?? document.documentElement; // Use documentElement as fallback
    const containerRect = container.getBoundingClientRect();

    // Adjust X if menu overflows right edge of container
    if (x + menuRect.width > containerRect.right) {
      adjustedX = containerRect.right - menuRect.width - 5; // 5px buffer
    }
    // Adjust X if menu overflows left edge of container (less common for context menus)
    if (x < containerRect.left) {
      adjustedX = containerRect.left + 5; // 5px buffer
    }

    // Adjust Y if menu overflows bottom edge of container
    if (y + menuRect.height > containerRect.bottom) {
      adjustedY = containerRect.bottom - menuRect.height - 5; // 5px buffer
    }
    // Adjust Y if menu overflows top edge of container
    if (y < containerRect.top) {
      adjustedY = containerRect.top + 5; // 5px buffer
    }
  }

  const menuContent = (
    <div
      ref={menuRef}
      className="context-menu-container"
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
      }}
      // Prevent context menu from triggering another context menu if right-clicked on itself
      onContextMenu={(e) => e.preventDefault()} 
    >
      <ul className="context-menu-list">
        {options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              className={`context-menu-option ${
                option.danger ? 'danger' : ''
              } ${option.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!option.disabled) {
                  option.action();
                  onClose(); // Close menu after action
                }
              }}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
  // Use createPortal to render the menu directly to document.body
  // This prevents any positioning or z-index issues within the React Flow canvas
  return createPortal(menuContent, document.body);
};
````

## File: src/app/tools/wiremapper/components/DynamicConfigInput.tsx
````typescript
import React from 'react';
import { Switch } from '@headlessui/react';
import { ConfigOption, ConfigOptionNumber, ConfigOptionBoolean, ConfigOptionSelect, ConfigOptionRadio, ConfigOptionText, Connector } from '../types';

interface DynamicConfigInputProps {
  option: ConfigOption;
  value: any; // The current value of the state corresponding to option.key
  onChange: (key: string, value: any) => void;
  disabled?: boolean; // Optional disabled state
}

export const DynamicConfigInput: React.FC<DynamicConfigInputProps> = ({ option, value, onChange, disabled = false }) => {
  const commonClasses = `w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  switch (option.type) {
    case 'number': {
      const numOption = option as ConfigOptionNumber;
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{numOption.label}</label>
          <input
            type="number"
            min={numOption.min}
            max={numOption.max}
            step={numOption.step ?? 1}
            value={value ?? numOption.defaultValue ?? ''}
            onChange={(e) => onChange(numOption.key, parseInt(e.target.value, 10) || numOption.defaultValue || 0)}
            disabled={disabled}
            className={commonClasses}
          />
        </div>
      );
    }
    case 'boolean': {
      const boolOption = option as ConfigOptionBoolean;
      // Using a simple checkbox for now, can switch back to Headless UI Switch if preferred
       return (
         <label className="inline-flex items-center">
           <input
             type="checkbox"
             checked={value ?? boolOption.defaultValue ?? false}
             onChange={(e) => onChange(boolOption.key, e.target.checked)}
             disabled={disabled}
             className={`rounded text-green-500 focus:ring-green-400 bg-gray-700 border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
           />
           <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{boolOption.label}</span>
         </label>
       );
       /* // Headless UI Switch implementation:
       return (
           <div className="flex items-center">
              <Switch
                checked={value ?? boolOption.defaultValue ?? false}
                onChange={(checked) => onChange(boolOption.key, checked)}
                disabled={disabled}
                className={`${value ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{boolOption.label}</span>
           </div>
       );
       */
    }
    case 'radio': {
      const radioOption = option as ConfigOptionRadio;
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{radioOption.label}</label>
          <div className="flex space-x-4">
            {radioOption.options.map((opt) => (
              <label key={String(opt.value)} className="inline-flex items-center">
                <input
                  type="radio"
                  name={radioOption.key} // Group radios by the key
                  value={String(opt.value)}
                  checked={value === opt.value}
                  onChange={(e) => onChange(radioOption.key, opt.value)} // Pass the actual value type
                  disabled={disabled}
                  className={`text-green-500 focus:ring-green-400 bg-gray-700 border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    case 'select': {
        const selectOption = option as ConfigOptionSelect;
        return (
            <div>
                <label className="block text-sm text-gray-400 mb-1">{selectOption.label}</label>
                <select
                    value={value ?? selectOption.defaultValue ?? ''}
                    onChange={(e) => onChange(selectOption.key, e.target.value)} // Adjust type if needed
                    disabled={disabled}
                    className={commonClasses}
                >
                    {selectOption.options.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
    case 'text': {
      const textOption = option as ConfigOptionText;
      return (
        <div>
          <label htmlFor={textOption.key} className="block text-sm font-medium text-gray-400 mb-1">
            {textOption.label}
          </label>
          <input
            type="text"
            id={textOption.key}
            name={textOption.key}
            value={value || ''}
            onChange={(e) => onChange(textOption.key, e.target.value)}
            placeholder={textOption.placeholder || ''}
            disabled={disabled || textOption.disabledCondition?.(value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {textOption.description && <p className="mt-1 text-xs text-gray-500">{textOption.description}</p>}
        </div>
      );
    }
    default:
      // Ensure exhaustive check (useful with TypeScript)
      const exhaustiveCheck: never = option;
      console.warn('Unhandled config option type:', exhaustiveCheck);
      return null;
  }
};

// Optional: Export component from an index file in the components directory
// e.g., in src/app/tools/wiremapper/components/index.ts
// export * from './DynamicConfigInput';
````

## File: src/app/tools/wiremapper/components/EditConnector.tsx
````typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Pin } from '../types';

// Define the type for items in the pinLayout state
interface PinLayoutItem {
  pos: number;
  row: number;
  col: number;
  visible: boolean;
  color?: string; // Make color optional as it might not always be set
}

interface EditConnectorProps {
  connectorId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const EditConnector: React.FC<EditConnectorProps> = ({ connectorId, onComplete, onCancel }) => {
  const { connectors, updateConnector } = useWireMapperStore();
  const connector = connectors.find(c => c.id === connectorId);

  const [name, setName] = useState('');
  const [type, setType] = useState('generic');
  const [rows, setRows] = useState(connector?.rows || 1);
  const [cols, setCols] = useState(connector?.cols || 8);
  const [gender, setGender] = useState(connector?.gender || 'male');
  const [pinLayout, setPinLayout] = useState<PinLayoutItem[]>([]); // Use PinLayoutItem type
  const [pinRemovalMode, setPinRemovalMode] = useState<'skip' | 'reindex'>('skip');
  const [viewMode, setViewMode] = useState<'basic' | 'rows' | 'advanced'>('basic');
  const [rowPinCounts, setRowPinCounts] = useState<number[]>([]);
  const [customLayout, setCustomLayout] = useState<string>('');
  const [presetLayout, setPresetLayout] = useState<'grid' | 'offset' | 'custom'>('grid');
  const [editMode, setEditMode] = useState<'standard' | 'advanced'>('standard');

  // Initialize form with connector data
  useEffect(() => {
    if (connector) {
      setName(connector.name);
      setType(connector.type);
      setRows(connector.rows);
      setCols(connector.cols);
      setGender(connector.gender);

      // Initialize pinLayout with data from connector.pins if available, or create default
      const initialPinLayout = Array.from({ length: connector.rows * connector.cols }).map((_, index) => {
        const row = Math.floor(index / connector.cols);
        const col = index % connector.cols;
        const pos = index + 1;
        // Try find existing pin data (including visibility and color)
        const existingPin = connector.pins.find(p => p.pos === pos);
        return {
          pos,
          row,
          col,
          visible: existingPin?.visible !== undefined ? existingPin.visible : true, // Default to visible
          color: existingPin?.color // Include color if available
        };
      });
      setPinLayout(initialPinLayout);

      // Initialize rowPinCounts based on existing pins or default cols
      const counts = Array(connector.rows).fill(0);
      connector.pins.forEach(pin => {
        const row = Math.floor((pin.pos - 1) / connector.cols);
        if (row >= 0 && row < connector.rows) {
          counts[row]++;
        }
      });
      // Set default full row if empty
      const defaultCounts = counts.map(count => count === 0 ? connector.cols : count);
      setRowPinCounts(defaultCounts);

      // Check if connector has a non-standard layout
      const hasAllPins = connector.pins.length === connector.rows * connector.cols;
      if (!hasAllPins) {
        setPresetLayout('custom');
        setEditMode('advanced');
      }
    } else {
      // Generate initial pin layout if no explicit pins (basic mode)
      const newPinLayout = Array.from({ length: rows * cols }).map((_, index) => ({
        pos: index + 1,
        row: Math.floor(index / cols),
        col: index % cols,
        visible: true, // Default to visible
        color: '#00ff9d' // Default color
      }));
      setPinLayout(newPinLayout);
      setRowPinCounts(Array(rows).fill(cols));
    }
  }, [connector, rows, cols]); // Add dependencies

  // Handle changes in rows or cols to update pinLayout
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = parseInt(e.target.value, 10);
    if (!isNaN(newRows) && newRows > 0) {
      setRows(newRows);
      if (editMode !== 'advanced') {
        const newLayout = Array.from({ length: newRows * cols }).map((_, index) => {
          const pos = index + 1;
          const existingPin = pinLayout.find(p => p.pos === pos);
          return {
            pos,
            row: Math.floor(index / cols),
            col: index % cols,
            visible: existingPin?.visible ?? true, // Preserve visibility
            color: existingPin?.color // Preserve color
          };
        });
        setPinLayout(newLayout);
        setRowPinCounts(Array(newRows).fill(cols));
      }
    }
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCols = parseInt(e.target.value, 10);
    if (!isNaN(newCols) && newCols > 0) {
      setCols(newCols);
      // Regenerate layout only if not in advanced mode, preserving visibility
      if (editMode !== 'advanced') {
        const newLayout = Array.from({ length: rows * newCols }).map((_, index) => {
          const pos = index + 1;
          const existingPin = pinLayout.find(p => p.pos === pos);
          return {
            pos,
            row: Math.floor(index / newCols),
            col: index % newCols,
            visible: existingPin?.visible ?? true, // Preserve visibility
            color: existingPin?.color // Preserve color
          };
        });
        setPinLayout(newLayout);
        setRowPinCounts(Array(rows).fill(newCols));
      }
    }
  };

  if (!connector) {
    return <div>Connector not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In standard mode, update basic properties and reset pins to default grid
    if (editMode === 'standard') {
      // When changing rows/cols in standard mode, recreate all pins
      updateConnector(connectorId, {
        name,
        type,
        rows, 
        cols,
        gender,
        // Create default pins (all visible)
        pins: Array(rows * cols).fill(0).map((_, i) => ({
          pos: i + 1,
          name: `Pin ${i + 1}`,
          color: '#00ff9d',
          visible: true
        }))
      });
    } else {
      // In advanced mode, update with custom pin layout
      if (presetLayout === 'grid') {
        // All pins visible in grid layout
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          pins: Array(rows * cols).fill(0).map((_, i) => ({
            pos: i + 1,
            name: `Pin ${i + 1}`,
            color: '#00ff9d',
            visible: true
          }))
        });
      } else if (rowPinCounts.some(count => count !== cols)) {
        // Using row-based pin configuration
        let pins = [];
        let pinNumber = 1;
        let currentPosIndex = 0; // Track original position for stable IDs if needed
        
        // Generate pins based on row pin counts
        for (let row = 0; row < rows; row++) {
          const pinsInRow = rowPinCounts[row] || cols;
          
          // Calculate left padding for centering if needed
          const emptySpace = cols - pinsInRow;
          const leftPadding = Math.floor(emptySpace / 2);
          
          for (let i = 0; i < pinsInRow; i++) {
            const actualCol = leftPadding + i;
            const originalPos = (row * cols) + actualCol + 1; // Estimate original grid position
            
            pins.push({
              // Use sequential numbering if reindexing, otherwise try to keep original pos
              pos: pinRemovalMode === 'reindex' ? pinNumber++ : originalPos,
              name: `Pin ${pinRemovalMode === 'reindex' ? pinNumber-1 : originalPos}`,
              color: '#00ff9d',
              row,
              col: actualCol,
              visible: true
            });
            currentPosIndex++;
          }
        }
        
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          // Filter out potential duplicate pos if using originalPos in skip mode
          // And sort by position
          pins: pins.filter((pin, index, self) => 
            index === self.findIndex((p) => p.pos === pin.pos)
          ).sort((a,b) => a.pos - b.pos)
        });
      } else {
        // Custom or offset layout - only include visible pins
        const visiblePins = pinLayout
          .filter(pin => pin.visible)
          // Ensure row/col data is included
          .map((pin, index) => ({
            pos: pinRemovalMode === 'reindex' ? index + 1 : pin.pos, // Apply reindexing if needed
            name: `Pin ${pinRemovalMode === 'reindex' ? index + 1 : pin.pos}`,
            color: pin.color || '#00ff9d', // Use existing pin color or default
            row: pin.row,
            col: pin.col,
            visible: true
          }));
          
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          // Sort by position just in case
          pins: visiblePins.sort((a,b) => a.pos - b.pos)
        });
      }
    }
    
    onComplete();
  };

  const handleTogglePin = (pos: number) => {
    setPinLayout(prev => {
      const result = prev.map(pin => 
        pin.pos === pos ? { ...pin, visible: !pin.visible } : pin
      );
      
      // If we're in reindex mode, we need to renumber the pins
      if (pinRemovalMode === 'reindex') {
        const visiblePins = result.filter(p => p.visible).sort((a, b) => {
          // Sort by row first, then by column
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
        });
        
        // Renumber visible pins sequentially
        return result.map(pin => {
          if (!pin.visible) return pin;
          const index = visiblePins.findIndex(p => p.pos === pin.pos);
          return { ...pin, pos: index + 1 };
        });
      }
      
      return result;
    });
  };
  
  const updateRowPinCount = (rowIndex: number, count: number) => {
    setRowPinCounts(prev => {
      const newCounts = [...prev];
      newCounts[rowIndex] = Math.min(count, cols);  // Ensure count doesn't exceed columns
      return newCounts;
    });
  };

  const resetLayoutToGrid = () => {
    setPresetLayout('grid');
    setPinLayout(prev => prev.map(pin => ({ ...pin, visible: true })));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl text-green-400 font-mono mb-4">Edit Connector</h2>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${editMode === 'standard' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setEditMode('standard')}
            >
              Standard
            </button>
            <button 
              className={`px-3 py-1 rounded text-xs ${editMode === 'advanced' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setEditMode('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Type</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="e.g. JST, Molex, etc."
            />
          </div>
          
          {editMode === 'standard' && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={handleRowsChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={handleColsChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>
            </>
          )}
          
          {editMode === 'advanced' && (
            <div className="mt-2 p-3 bg-gray-850 rounded border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Pin Layout Options:</div>
              
              {/* Pin Removal Mode Selection */}
              <div className="mb-2">
                <label className="text-sm text-gray-400 block mb-1">Pin Removal Mode:</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={pinRemovalMode === 'skip'}
                      onChange={() => setPinRemovalMode('skip')}
                      className="text-green-500 focus:ring-green-400"
                    />
                    <span className="ml-2 text-gray-300 text-xs">Skip (1, 2, X, 4)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={pinRemovalMode === 'reindex'}
                      onChange={() => setPinRemovalMode('reindex')}
                      className="text-green-500 focus:ring-green-400"
                    />
                    <span className="ml-2 text-gray-300 text-xs">Reindex (1, 2, 3)</span>
                  </label>
                </div>
              </div>
              
              {/* Row-based Configuration */}
              <div className="mb-3">
                <label className="text-sm text-gray-400 block mb-1">Row Pin Counts:</label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-config-${rowIndex}`} className="flex items-center">
                      {/* Simplified label */}
                      <span className="mr-2 text-xs text-gray-400">R{rowIndex + 1}:</span>
                      <input
                        type="number"
                        min="0"
                        max={cols}
                        value={rowPinCounts[rowIndex] || cols}
                        onChange={(e) => updateRowPinCount(rowIndex, parseInt(e.target.value) || 0)}
                        className="w-12 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Layout Preset Selector */}
              <div className="mb-3 flex space-x-2">
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'grid' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => {
                    setPresetLayout('grid');
                    // Standard grid layout - all pins visible
                    setPinLayout(prev => prev.map(pin => ({ ...pin, visible: true })));
                  }}
                >
                  Standard Grid
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'offset' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => {
                    setPresetLayout('offset');
                    // Create an offset/staggered pin layout like 7-6-6-7
                    if (rows >= 4) {
                      const newLayout = pinLayout.map(pin => {
                        let visible = true;
                        // For rows 1 and 4 (index 0 and 3), show all pins
                        // For rows 2 and 3 (index 1 and 2), hide the first and last pin if there are enough columns
                        if ((pin.row === 1 || pin.row === 2) && cols > 2) {
                          if (pin.col === 0 || pin.col === cols - 1) {
                            visible = false;
                          }
                        }
                        return { ...pin, visible };
                      });
                      setPinLayout(newLayout);
                    }
                  }}
                >
                  Offset (7-6-6-7)
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'custom' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => setPresetLayout('custom')}
                >
                  Custom
                </button>
              </div>
              
              {/* Visual Pin Editor */}
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Pin Preview:</div>
                <div 
                  className="grid gap-2 bg-gray-900 p-2 rounded border border-gray-700"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {pinLayout.map(pin => {
                    // Calculate the displayed number based on reindex mode
                    let displayPos: number | string = pin.pos;
                    if (pin.visible && pinRemovalMode === 'reindex') {
                      const visiblePins = pinLayout
                        .filter(p => p.visible)
                        .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col); // Ensure consistent order
                      const reindexPos = visiblePins.findIndex(p => p.pos === pin.pos);
                      if (reindexPos !== -1) {
                        displayPos = reindexPos + 1;
                      }
                    } else if (!pin.visible) {
                      displayPos = 'X';
                    }
                    
                    return (
                      <button
                        key={`pin-vis-${pin.pos}`}
                        type="button" // Prevent form submission
                        onClick={() => handleTogglePin(pin.pos)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono border-2 ${pin.visible ? 'border-green-500 bg-gray-700 text-white' : 'border-gray-600 bg-gray-800 text-gray-500'}`}
                      >
                        {/* Display calculated position */}
                        {displayPos}
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Active pins: {pinLayout.filter(p => p.visible).length} of {rows * cols}
                </div>
                <button 
                  type="button" // Prevent form submission
                  onClick={resetLayoutToGrid}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Reset to Grid
                </button>
              </div>

              {/* Tooltip */}
              <p className="text-xs text-yellow-500 mt-3">
                💡 Click pins to toggle them on/off to create custom layouts.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Gender</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="mr-1"
                />
                <span className="text-gray-300 text-sm">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="mr-1"
                />
                <span className="text-gray-300 text-sm">Female</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/index.ts
````typescript
/**
 * Wire Mapper Components Barrel File
 * This file exports all component modules from the components directory,
 * allowing for cleaner imports throughout the application.
 */

export * from './Connector';
export * from './ConnectorBuilder';
export * from './ConnectorCanvas';
// export * from './Wire'; // Remove this line - Component doesn't exist here
export * from './WireMapper';
export * from './ConnectorRenderer'; 
export { MappingList } from './MappingList';
export { ProjectControls } from './ProjectControls';
export { PinDetail } from './PinDetail';
export { ConnectorDetail } from './ConnectorDetail';
export { PinEditor } from './PinEditor';
export { ConnectorPreview } from './ConnectorPreview';
````

## File: src/app/tools/wiremapper/components/MappingList.tsx
````typescript
'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';

interface MappingListProps {
  filterConnectorId?: string | null; // Optional ID to filter by
}

export const MappingList: React.FC<MappingListProps> = ({ filterConnectorId }) => {
  const { connectors, mappings, updateMapping, removeMapping, focusedWireId, setFocusedWireId } = useWireMapperStore();

  const filteredMappings = filterConnectorId
    ? mappings.filter(m => m.source.connectorId === filterConnectorId || m.target.connectorId === filterConnectorId)
    : mappings; // Show all if no filter ID is provided

  // Utility function to get pin name by connector ID and pin position
  const getPinLabel = (connectorId: string, pinPos: number): string => {
    // Check if pinPos is valid
    if (typeof pinPos !== 'number' || isNaN(pinPos)) {
      return 'Invalid Pin Pos';
    }
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) {
      // Shorten connectorId for display if not found
      const shortId = connectorId?.substring(0, 6) ?? 'N/A';
      return `Conn ${shortId}? Pin ${pinPos}`;
    }

    const pin = connector.pins.find(p => p.pos === pinPos);
    if (!pin) {
      // Pin position not found within this connector
      return `Pin ${pinPos} (Not Found)`;
    }

    // Pin found, return its name or default label
    return pin.name || `Pin ${pinPos}`;
  };

  // Utility function to get connector name by ID
  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector ? connector.name : 'Unknown';
  };

  if (filteredMappings.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {filterConnectorId ? 'No connections for this connector' : 'No wire connections yet'}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full"> 
      <div className="flex-grow overflow-y-auto min-h-0"> 
        <table className="w-full text-sm text-left text-gray-300">
          <caption className="sr-only">Wire Mappings - Click a row to highlight that connection</caption>
          <thead className="text-xs uppercase bg-gray-800">
            <tr>
              <th className="px-3 py-2">From</th>
              <th className="px-3 py-2">To</th>
              <th className="px-3 py-2">Net Name</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.map((mapping) => (
              <tr 
                key={mapping.id} 
                className={`border-b border-gray-800 cursor-pointer ${mapping.wireId === focusedWireId ? 'bg-gray-700' : ''}`}
                onClick={() => {
                  // Toggle focus: if already focused, clear focus; otherwise set focus
                  if (mapping.wireId === focusedWireId) {
                    setFocusedWireId(null);
                  } else {
                    setFocusedWireId(mapping.wireId);
                  }
                }}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: mapping.color || 'transparent' }} // Ensure color has a fallback
                    />
                    <div>
                      <div className="font-mono text-xs">{getConnectorName(mapping.source.connectorId)}</div>
                      <div className="text-gray-500 text-xs">{getPinLabel(mapping.source.connectorId, mapping.source.pinPos)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div>
                    <div className="font-mono text-xs">{getConnectorName(mapping.target.connectorId)}</div>
                    <div className="text-gray-500 text-xs">{getPinLabel(mapping.target.connectorId, mapping.target.pinPos)}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={mapping.netName || ''} // Ensure value is not undefined
                    onChange={(e) => updateMapping(mapping.id, { netName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    {mapping.wireId === focusedWireId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setFocusedWireId(null);
                        }}
                        className="text-green-400 hover:text-green-300 text-xs"
                      >
                        Show All
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        removeMapping(mapping.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/Modal.tsx
````typescript
import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/PinDetail.tsx
````typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Pin } from '../types';
import debounce from 'lodash.debounce';

interface LocalPinData extends Pin {
  connectorId: string;
  originalPos: number; // To track if the viewed pin identity changes
}

export const PinDetail: React.FC = () => {
  const { connectors, selectedPin, updatePinDetailsAndNet, setSelectedPin } = useWireMapperStore();
  const [pinData, setPinData] = useState<LocalPinData | null>(null);

  useEffect(() => {
    if (!selectedPin || !selectedPin.connectorId || selectedPin.pinPos === null) {
      setPinData(null);
      return;
    }

    const storeConnector = connectors.find(c => c.id === selectedPin.connectorId);
    const storePin = storeConnector?.pins.find(p => p.pos === selectedPin.pinPos);

    if (!storePin) {
      setPinData(null); 
      return;
    }

    // If selectedPin identity changes, or if pinData is null (initial load for current selection)
    if (!pinData || pinData.connectorId !== selectedPin.connectorId || pinData.originalPos !== selectedPin.pinPos) {
      setPinData({
        ...storePin,
        connectorId: selectedPin.connectorId,
        originalPos: selectedPin.pinPos,
        config: storePin.config ?? {},
      });
    } else {
      // Pin identity is the same, pinData is populated. Compare and merge carefully.
      const activeElement = document.activeElement as HTMLElement;
      const focusedInputName = (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) 
                              ? (activeElement as HTMLInputElement).name 
                              : null;

      let newPinData = { ...pinData }; // Start with current local state
      let needsUpdate = false;

      // Fields to check for updates from storePin
      const fieldsToSync: (keyof Pin)[] = ['name', 'netName', 'desc', 'voltage', 'signalType'];

      fieldsToSync.forEach(field => {
        const storeValue = storePin[field];
        const localValue = pinData[field];
        // Use a more robust check for undefined/null vs empty string if needed
        const normalizedStoreValue = storeValue === undefined || storeValue === null ? "" : storeValue;
        const normalizedLocalValue = localValue === undefined || localValue === null ? "" : localValue;

        if (normalizedStoreValue !== normalizedLocalValue) {
          if (focusedInputName !== field) { // Only update if this specific field is NOT focused
            newPinData = { ...newPinData, [field]: storeValue };
            needsUpdate = true;
          }
        }
      });

      // Sync color (from config)
      const storeColor = storePin.config?.color;
      const localColor = pinData.config?.color;
      if (storeColor !== localColor) {
        if (focusedInputName !== 'color') { // Assuming color input is named 'color'
          newPinData.config = { ...newPinData.config, color: storeColor };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        setPinData(newPinData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPin, connectors]); // pinData is intentionally omitted from deps here to prevent potential update loops 
                                 // and to give local typing precedence. The logic above handles merging from `connectors` 
                                 // when `selectedPin` itself hasn't changed identity.

  const debouncedUpdatePin = useCallback(
    debounce((connectorId: string, pinPos: number, updates: Partial<Pin>) => {
      const { config: configUpdates, ...topLevelUpdates } = updates;
      const currentPin = connectors.find(c => c.id === connectorId)?.pins.find(p => p.pos === pinPos);
      const currentConfig = currentPin?.config ?? {};
      const newConfig = { ...currentConfig, ...configUpdates };

      updatePinDetailsAndNet(connectorId, pinPos, { ...topLevelUpdates, config: newConfig });
    }, 300),
    [connectors, updatePinDetailsAndNet]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!pinData || !selectedPin) return; 
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, [name]: value };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { [name]: value });
      return updatedPin;
    });
  };

  const handleColorTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!pinData || !selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { config: { color: value } });
      return updatedPin;
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!pinData || !selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { config: { color: value } });
      return updatedPin;
    });
  };

  if (!pinData) {
    return <div className="text-center text-gray-500 p-4">Select a pin to view details.</div>;
  }

  return (
    <div className="p-4 bg-gray-800 text-white h-full overflow-y-auto space-y-4">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Pin {pinData.number ?? pinData.pos} Details</h3>

      {/* Pin Name Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Pin Name</label>
        <input
          type="text"
          name="name"
          value={pinData.name}
          onChange={handleChange}
          placeholder="e.g., 12V Power"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Net Name Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Net Name</label>
        <input
          type="text"
          name="netName"
          value={pinData.netName ?? ''}
          onChange={handleChange}
          placeholder="e.g., PWR_RAIL, CAN_H"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Color</label>
          <div className="flex items-center">
            <input
              type="color"
              name="color"
              value={pinData.config?.color ?? '#ffffff'}
              onChange={handleColorChange}
              className="bg-gray-800 border border-gray-700 rounded w-10 h-10 cursor-pointer"
            />
            <input
              type="text"
              name="color"
              value={pinData.config?.color ?? '#ffffff'}
              onChange={handleColorTextChange}
              className="flex-1 ml-2 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          name="desc"
          value={pinData.desc ?? ''}
          onChange={handleChange}
          rows={3}
          placeholder="Optional description for this pin."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Voltage Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Voltage</label>
        <input
          type="text"
          name="voltage"
          value={pinData.voltage ?? ''}
          onChange={handleChange}
          placeholder="e.g., 5V, 3.3V"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Signal Type Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Signal Type</label>
        <input
          type="text"
          name="signalType"
          value={pinData.signalType ?? ''}
          onChange={handleChange}
          placeholder="e.g., Analog In, Digital Out, PWM"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <button
        onClick={() => setSelectedPin(null, null)}
        className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow-md transition-colors"
      >
        Clear Selection
      </button>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/PinDisplay.tsx
````typescript
import React from 'react';
import classNames from 'classnames';
import { Pin } from '../types';
import { PIN_SIZE } from '../constants'; // Assuming PIN_SIZE might be needed

// --- PinDisplay Component ---
export interface PinDisplayProps {
  pin: Pin;
  isSelected: boolean;
  isHovered: boolean;
  isConnected: boolean;
  darkMode: boolean;
  size?: number;
  gender: 'male' | 'female';
  onClick?: (pinPos: number) => void;
  onContextMenu?: (e: React.MouseEvent, pinPos: number) => void;
  onMouseEnter?: (pinPos: number) => void;
  onMouseLeave?: (pinPos: number) => void;
  children?: React.ReactNode; // To allow embedding things like React Flow Handles
}

export const PinDisplay: React.FC<PinDisplayProps> = ({
  pin,
  isSelected,
  isHovered,
  isConnected,
  darkMode,
  size = PIN_SIZE, // Default size
  gender,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  // --- Dynamic Class Calculation ---
  const pinClasses = classNames(
    'connector-pin-display',
    {
      'female': gender === 'female',
      'selected': isSelected,
      'connected': isConnected,
      'hovered': isHovered, // Add hovered class
      'dark-theme': darkMode, // Add dark-theme class when darkMode is true
    }
  );

  // --- Inline Styles (Only for dynamic values or overrides) ---
  const inlineStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.45}px`,
  };

  // Apply pin-specific color override *only* if it exists
  // Restore original check: Apply config color if it exists
  if (pin.config?.color) { 
    inlineStyle.backgroundColor = pin.config.color;
  }
  
  // If this pin has a netName, show that as the background
  if (pin.netName && pin.netColor) {
    inlineStyle.backgroundColor = pin.netColor;
  }

  // --- Event Handlers ---
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(pin.pos);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('PinDisplay context menu triggered:', pin.pos, 'Event:', e.clientX, e.clientY);
    if (onContextMenu) {
      onContextMenu(e, pin.pos);
    }
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(pin.pos);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.(pin.pos);
  };

  return (
    <div
      className={pinClasses} // Apply dynamic classes
      style={inlineStyle} // Apply necessary inline styles
      onClick={onClick ? handleClick : undefined}
      onContextMenu={onContextMenu ? handleContextMenu : undefined}
      onMouseEnter={onMouseEnter ? handleMouseEnter : undefined}
      onMouseLeave={onMouseLeave ? handleMouseLeave : undefined}
      title={`Pin ${pin.pos}${pin.name ? ': ' + pin.name : ''}${pin.netName ? ' | Net: ' + pin.netName : ''}`}
      data-pin-pos={pin.pos} // Add data attribute for the global context menu handler
    >
      {pin.pos} {/* Display pin number/position */}
      {children} {/* Render children, e.g., React Flow Handle */}
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/PinEditor.tsx
````typescript
'use client';

import React from 'react';
import { Pin } from '../types';

interface PinEditorProps {
  pins: Pin[];
  onPinUpdate: (updatedPin: Pin) => void;
  onToggleVisibility: (index: number) => void;
}

export const PinEditor: React.FC<PinEditorProps> = ({ pins, onPinUpdate, onToggleVisibility }) => {
  if (!pins || pins.length === 0) {
    return <p className="text-sm text-gray-500">No pins defined.</p>;
  }

  // Handle name input changes
  const handleNameChange = (index: number, newName: string) => {
    const pinToUpdate = pins.find(p => p.index === index);
    if (pinToUpdate) {
      onPinUpdate({ ...pinToUpdate, name: newName });
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-850 space-y-2">
      <h4 className="text-sm font-medium text-gray-400">Pin Configuration</h4>
      <p className="text-xs text-gray-500">Detailed pin editor UI will go here.</p>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> 
        {pins.map((pin) => (
          <div key={pin.index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
            <span className="text-sm font-mono text-gray-400 w-8 text-right">{pin.index}</span>
            <input
              type="text"
              value={pin.name || ''}
              onChange={(e) => handleNameChange(pin.index, e.target.value)}
              placeholder={`Pin ${pin.index} Name`}
              className="flex-grow bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            {/* --- Visibility Toggle Button --- */}
            <button
              onClick={() => onToggleVisibility(pin.index)}
              className={`w-16 text-xs px-2 py-1 rounded transition-colors
                ${pin.visible === false ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                         : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
            >
              {pin.visible === false ? 'Show' : 'Hide'}
            </button>
            {/* --- End Visibility Toggle Button --- */}
          </div>
        ))}
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/PrintView.tsx
````typescript
'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Mapping } from '../types';

// Connector layout constants - matching those in WiringDiagramPreview but adjusted for print
const CONNECTOR_WIDTH = 120;
const CONNECTOR_HEADER_HEIGHT = 30;
const CONNECTOR_TYPE_HEADER_HEIGHT = 20;
const PIN_ROW_HEIGHT = 28;
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 50;

export const PrintView: React.FC = () => {
  const { connectors, mappings } = useWireMapperStore();

  // Helper function to get connector name
  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector ? connector.name : 'Unknown Connector';
  };

  // Helper function to get pin label with position
  const getPinLabel = (connectorId: string, pinPos: number): string => {
    if (typeof pinPos !== 'number' || isNaN(pinPos)) {
      return 'Invalid Pin';
    }
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) {
      return `Pin ${pinPos}`;
    }
    const pin = connector.pins.find(p => p.pos === pinPos);
    if (!pin) {
      return `Pin ${pinPos}`;
    }
    if (pin.name) {
      return `${pin.name} (Pos: ${pinPos})`;
    }
    return `Pin ${pinPos}`;
  };

  // Calculate overall dimensions for the print layout
  const calculatePrintLayout = () => {
    let maxWidth = 0;
    let totalHeight = 0;
    
    // Calculate space needed for connectors
    const connectorRows: Connector[][] = [];
    let currentRow: Connector[] = [];
    let currentRowWidth = 0;
    
    // First arrange connectors in rows
    connectors.forEach(connector => {
      const connectorHeight = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + 
                            (connector.pins.length * PIN_ROW_HEIGHT);
      
      if (currentRowWidth + CONNECTOR_WIDTH > 800) {
        // Start a new row if this one would be too wide
        connectorRows.push([...currentRow]);
        currentRow = [connector];
        currentRowWidth = CONNECTOR_WIDTH;
      } else {
        // Add to current row
        currentRow.push(connector);
        currentRowWidth += CONNECTOR_WIDTH + HORIZONTAL_GAP;
      }
      
      maxWidth = Math.max(maxWidth, currentRowWidth);
    });
    
    // Add last row if not empty
    if (currentRow.length > 0) {
      connectorRows.push(currentRow);
    }
    
    // Calculate height based on rows
    connectorRows.forEach(row => {
      const maxRowHeight = Math.max(...row.map(connector => 
        CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (connector.pins.length * PIN_ROW_HEIGHT)
      ));
      totalHeight += maxRowHeight + VERTICAL_GAP;
    });

    // Add space for connection tables (rough estimate)
    totalHeight += connectors.length * 200; // ~200px per connector table
    
    return {
      width: Math.max(maxWidth, 900), // Minimum 900px width
      height: totalHeight,
      connectorRows
    };
  };

  const { width, height, connectorRows } = calculatePrintLayout();

  // Render the connector visual with pins
  const renderConnector = (connector: Connector, x: number, y: number) => {
    const connectorHeight = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + 
                          (connector.pins.length * PIN_ROW_HEIGHT);
    
    return (
      <g key={connector.id} transform={`translate(${x}, ${y})`}>
        {/* Connector outline */}
        <rect 
          x="0" 
          y="0" 
          width={CONNECTOR_WIDTH} 
          height={connectorHeight}
          stroke="#333"
          strokeWidth="1"
          fill="white"
          rx="4"
          ry="4"
        />
        
        {/* Connector name */}
        <text 
          x={CONNECTOR_WIDTH / 2} 
          y={CONNECTOR_HEADER_HEIGHT / 2}
          textAnchor="middle" 
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="14px"
          fill="#333"
        >
          {connector.name}
        </text>
        
        {/* Connector type/info */}
        <text 
          x={CONNECTOR_WIDTH / 2} 
          y={CONNECTOR_HEADER_HEIGHT + (CONNECTOR_TYPE_HEADER_HEIGHT / 2)}
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="12px"
          fill="#555"
        >
          {connector.type || `${connector.pins.length}-pin`}
        </text>
        
        {/* Pin Rows */}
        {connector.pins.map((pin, index) => {
          const pinY = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (index * PIN_ROW_HEIGHT);
          const pinColor = pin.config?.color || '#888';
          
          return (
            <g key={`pin-${pin.pos}`}>
              {/* Pin circle */}
              <circle 
                cx="15" 
                cy={pinY + (PIN_ROW_HEIGHT / 2)}
                r="10"
                fill={pinColor}
                stroke="#333"
                strokeWidth="1"
              />
              
              {/* Pin position */}
              <text 
                x="15" 
                y={pinY + (PIN_ROW_HEIGHT / 2)}
                textAnchor="middle" 
                dominantBaseline="central"
                fontSize="10px"
                fontWeight="bold"
                fill="white"
              >
                {pin.pos}
              </text>
              
              {/* Pin name/label */}
              <text 
                x="35" 
                y={pinY + (PIN_ROW_HEIGHT / 2)}
                dominantBaseline="central"
                fontSize="12px"
                fill="#333"
              >
                {pin.name || `Pin ${pin.pos}`}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // Render connection tables
  const renderConnectionTables = () => {
    return connectors.map((connector, index) => {
      const relevantMappings = mappings.filter(
        m => m.source.connectorId === connector.id || m.target.connectorId === connector.id
      );

      if (relevantMappings.length === 0) return null;

      return (
        <div key={`table-${connector.id}`} className="print-connection-table">
          <h3 className="print-table-header">{connector.name} Connections</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>Own Pin</th>
                <th>Connected To (Connector)</th>
                <th>Connected To (Pin)</th>
                <th>Net Name</th>
              </tr>
            </thead>
            <tbody>
              {relevantMappings.map(mapping => {
                const isSourceLocal = mapping.source.connectorId === connector.id;
                const localPinPos = isSourceLocal ? mapping.source.pinPos : mapping.target.pinPos;
                const remoteConnectorId = isSourceLocal ? mapping.target.connectorId : mapping.source.connectorId;
                const remotePinPos = isSourceLocal ? mapping.target.pinPos : mapping.source.pinPos;
                
                // Get the pin for color indicator
                const localPin = connector.pins.find(p => p.pos === localPinPos);
                const pinColor = localPin?.config?.color || '#888';

                return (
                  <tr key={mapping.id}>
                    <td>
                      <div className="print-pin-cell">
                        <div className="print-pin-color" style={{ backgroundColor: pinColor }}></div>
                        <span>{getPinLabel(connector.id, localPinPos)}</span>
                      </div>
                    </td>
                    <td>{getConnectorName(remoteConnectorId)}</td>
                    <td>{getPinLabel(remoteConnectorId, remotePinPos)}</td>
                    <td>{mapping.netName || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    });
  };

  // No connectors case
  if (connectors.length === 0) {
    return (
      <div className="print-view">
        <h1 className="print-title">Wire Harness Documentation</h1>
        <p className="print-message">No connectors available to print.</p>
      </div>
    );
  }

  return (
    <div className="print-view">
      <h1 className="print-title">Wire Harness Documentation</h1>
      
      {/* SVG for connector visuals */}
      <div className="print-visual-section">
        <h2 className="print-section-header">Connector Diagrams</h2>
        <svg width={width} height={height * 0.4} className="print-connectors-svg">
          {connectorRows.map((row, rowIndex) => {
            let currentX = 10;
            const rowY = rowIndex * (PIN_ROW_HEIGHT * 10 + VERTICAL_GAP) + 10;
            
            return row.map(connector => {
              const connectorX = currentX;
              currentX += CONNECTOR_WIDTH + HORIZONTAL_GAP;
              return renderConnector(connector, connectorX, rowY);
            });
          })}
        </svg>
      </div>
      
      {/* Tables for connections */}
      <div className="print-tables-section">
        <h2 className="print-section-header">Connection Tables</h2>
        {renderConnectionTables()}
      </div>
      
      {/* Print-specific styles */}
      <style jsx="true">{`
        /* Print view styles */
        .print-view {
          padding: 20px;
          max-width: 100%;
          font-family: Arial, sans-serif;
          color: #000;
          background-color: white;
        }
        
        .print-title {
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
          color: #333;
        }
        
        .print-section-header {
          font-size: 18px;
          margin: 25px 0 15px;
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8px;
        }
        
        .print-visual-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .print-connectors-svg {
          max-width: 100%;
          border: 1px solid #eee;
        }
        
        .print-tables-section {
          page-break-before: auto;
        }
        
        .print-connection-table {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .print-table-header {
          font-size: 16px;
          margin: 15px 0 10px;
          color: #444;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .print-table th, .print-table td {
          border: 1px solid #ccc;
          padding: 8px 12px;
          text-align: left;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .print-pin-cell {
          display: flex;
          align-items: center;
        }
        
        .print-pin-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          border: 1px solid #333;
        }
        
        .print-message {
          padding: 30px;
          text-align: center;
          color: #666;
        }

        /* Print-specific media query */
        @media print {
          body {
            background-color: white;
          }
          
          .print-view {
            padding: 0;
          }
          
          .print-title {
            margin-top: 0;
          }
          
          .print-connection-table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
````

## File: src/app/tools/wiremapper/components/ProjectControls.tsx
````typescript
'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { WireMapperProject } from '../types';
import { openPrintView } from '../utils/printUtils';

interface ProjectControlsProps {
  onNewConnector: () => void;
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({ onNewConnector }) => {
  const { projectName, setProjectName, saveProject, loadProject, clearProject, connectors, mappings } = useWireMapperStore();

  const handleExport = () => {
    const projectData = saveProject();
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_wiremapper.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const projectData = JSON.parse(content) as WireMapperProject;
        loadProject(projectData);
      } catch (error) {
        console.error('Failed to parse JSON file:', error);
        alert('Invalid project file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleClearProject = () => {
    if (confirm('Are you sure you want to clear the current project? This action cannot be undone.')) {
      clearProject();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={projectName}
          onChange={handleProjectNameChange}
          placeholder="Project Name"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onNewConnector}
          className="px-3 py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition"
        >
          Add Connector
        </button>
        
        <button
          onClick={handleExport}
          className="px-3 py-2 bg-gray-800 text-blue-400 rounded hover:bg-gray-700 transition"
        >
          Export
        </button>
        
        <label className="px-3 py-2 bg-gray-800 text-purple-400 rounded hover:bg-gray-700 transition cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        
        <button
          onClick={() => openPrintView(connectors, mappings)}
          className="px-3 py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition"
        >
          Print
        </button>
        
        <button
          onClick={handleClearProject}
          className="px-3 py-2 bg-gray-800 text-red-400 rounded hover:bg-gray-700 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/TableView.tsx
````typescript
'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';

export const TableView: React.FC = () => {
  const { connectors, mappings } = useWireMapperStore();

  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector ? connector.name : 'Unknown Connector';
  };

  const getPinLabel = (connectorId: string, pinPos: number): string => {
    if (typeof pinPos !== 'number' || isNaN(pinPos)) {
      return 'Invalid Pin';
    }
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) {
      return `Pin ${pinPos} (Conn?)`;
    }
    const pin = connector.pins.find(p => p.pos === pinPos);
    if (!pin) {
      return `Pin ${pinPos} (N/F)`; // N/F for Not Found in this context
    }
    if (pin.name) {
      return `${pin.name} (Pos: ${pinPos})`;
    }
    return `Pin ${pinPos}`;
  };

  if (connectors.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
        No connectors to display.
      </div>
    );
  }
  
  if (mappings.length === 0 && connectors.length > 0) {
    return (
      <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
        No connections made yet.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-4 h-full space-y-8 bg-gray-950">
      {connectors.map(connector => {
        const relevantMappings = mappings.filter(
          m => m.source.connectorId === connector.id || m.target.connectorId === connector.id
        );

        return (
          <div key={connector.id}>
            <h3 className="text-xl font-semibold text-green-400 mb-3 sticky top-0 bg-gray-950 py-2 z-10 border-b border-gray-800">
              {connector.name || `Connector ${connector.id.substring(0,6)}...`} Connections
            </h3>
            {relevantMappings.length === 0 ? (
              <p className="text-gray-500 text-sm pl-2 italic">No connections for this connector.</p>
            ) : (
              <table className="min-w-full text-sm text-left text-gray-300 bg-gray-900 rounded-lg">
                <thead className="text-xs uppercase bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 w-12">Color</th>
                    <th className="px-4 py-3">Own Pin</th>
                    <th className="px-4 py-3">Connected To (Connector)</th>
                    <th className="px-4 py-3">Connected To (Pin)</th>
                    <th className="px-4 py-3">Net Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {relevantMappings.map(mapping => {
                    const isSourceLocal = mapping.source.connectorId === connector.id;
                    const localPinPos = isSourceLocal ? mapping.source.pinPos : mapping.target.pinPos;
                    const remoteConnectorId = isSourceLocal ? mapping.target.connectorId : mapping.source.connectorId;
                    const remotePinPos = isSourceLocal ? mapping.target.pinPos : mapping.source.pinPos;

                    return (
                      <tr key={mapping.id} className="hover:bg-gray-850 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: mapping.color || 'transparent' }}
                            title={`Wire color: ${mapping.color || 'Default'}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{getPinLabel(connector.id, localPinPos)}</td>
                        <td className="px-4 py-3 font-mono text-xs">{getConnectorName(remoteConnectorId)}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{getPinLabel(remoteConnectorId, remotePinPos)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${mapping.netName ? 'bg-gray-700 text-gray-200' : 'text-gray-500'}`}>
                            {mapping.netName || '--'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/WireMapper.tsx
````typescript
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { WireMapperProject, Connector } from '../types';

// Import components directly - these will be properly resolved
// since they're co-located in the same directory
import ConnectorCanvas from './ConnectorCanvas';
import { ConnectorBuilder } from './ConnectorBuilder';
import { ConnectorDetail } from './ConnectorDetail';
import { MappingList } from './MappingList';
import { ProjectControls } from './ProjectControls';
import { PinDetail } from './PinDetail';
import { Modal } from './Modal';
import { WiringDiagramPreview } from './WiringDiagramPreview';
import { TableView } from './TableView';

// View mode types
type ViewMode = 'canvas' | 'diagram' | 'table';

export const WireMapper: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null); // State for connector being edited
  const [viewMode, setViewMode] = useState<ViewMode>('canvas'); // Default to canvas view

  const { 
    projectName, 
    connectors, 
    mappings, 
    selectedPin,
    selectedConnectorId,
    settings,
    loadProject,
    clearProject,
    updateSettings,
    setMode, // Add setMode action
  } = useWireMapperStore();

  const selectedConnector = useMemo(() => 
    connectors.find(c => c.id === selectedConnectorId), 
    [connectors, selectedConnectorId]
  );

  // Log state values on re-render
  console.log('[WireMapper] Rendering. selectedConnectorId:', selectedConnectorId);
  console.log('[WireMapper] Rendering. selectedPin (object):', JSON.stringify(selectedPin));
  console.log('[WireMapper] Rendering. derived selectedConnector (object):', selectedConnector ? selectedConnector.id : null, selectedConnector);

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      // Load project data
      const savedProject = localStorage.getItem('wireMapperProject');
      if (savedProject) {
        loadProject(JSON.parse(savedProject));
      }
      
      // Load settings data
      const savedSettings = localStorage.getItem('wireMapperSettings');
      if (savedSettings) {
        updateSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, [loadProject, updateSettings]);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    try {
      // Always save, even with empty connectors
      const project: WireMapperProject = {
        projectName,
        connectors,
        mappings
      };
      localStorage.setItem('wireMapperProject', JSON.stringify(project));
    } catch (error) {
      console.error('Failed to save project to localStorage:', error);
    }
  }, [projectName, connectors, mappings]);
  
  // Save settings separately
  useEffect(() => {
    try {
      localStorage.setItem('wireMapperSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  // Callback for ProjectControls to open builder for NEW connector
  const handleNewConnector = () => {
    setEditingConnector(null); // Ensure we are in create mode
    setShowBuilder(true);
  };

  // Callback for Edit button to open builder for EXISTING connector
  const handleEditConnector = (connector: Connector) => {
    setEditingConnector(connector); // Set the connector to edit
    setShowBuilder(true);
  };

  // Callback for modal close
  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingConnector(null); // Reset editing state on close
  };

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="text-xl font-mono text-green-400">
          {projectName || 'New Harness'}
        </h2>
        <ProjectControls 
          onNewConnector={handleNewConnector} // Use updated handler
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Canvas area - Main workspace */}
        <div className="md:col-span-2 bg-gray-950 border border-gray-800 rounded-lg p-4 h-[850px] overflow-hidden flex flex-col">
          {/* Control toolbar */}
          {connectors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 border-b border-gray-800 pb-3">
              {/* View Mode Toggles - Always show first */}
              <div className="flex mr-4 border-r border-gray-700 pr-3">
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`px-3 py-1 rounded-l text-sm ${viewMode === 'canvas' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  title="Interactive Canvas View"
                >
                  Canvas View
                </button>
                <button
                  onClick={() => setViewMode('diagram')}
                  className={`px-3 py-1 text-sm ${viewMode === 'diagram' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  title="Documentation-style Wiring Diagram"
                >
                  Wiring Diagram
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-r text-sm ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  title="Table View of Connections"
                >
                  Table View
                </button>
              </div>
              
              {/* Only show these controls in canvas view */}
              {viewMode === 'canvas' && (
                <>
                  {/* Wire Visibility Toggle */}
                  <button
                    onClick={() => updateSettings({ showWires: !settings.showWires })}
                    className={`px-3 py-1 rounded text-sm transition-colors ${settings.showWires ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    title="Toggle wire visibility"
                  >
                    {settings.showWires ? 'Hide Wires' : 'Show Wires'}
                  </button>
                  
                  {/* Grid Toggle */}
                  <button
                    onClick={() => updateSettings({ showGrid: !settings.showGrid })}
                    className={`px-3 py-1 rounded text-sm transition-colors ${settings.showGrid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    title="Toggle grid visibility"
                  >
                    {settings.showGrid ? 'Hide Grid' : 'Show Grid'}
                  </button>
                  
                  {/* Snap to Grid Toggle */}
                  <button
                    onClick={() => updateSettings({ snapToGrid: !settings.snapToGrid })}
                    className={`px-3 py-1 rounded text-sm transition-colors ${settings.snapToGrid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    title="Toggle snap to grid"
                  >
                    {settings.snapToGrid ? 'Snap: On' : 'Snap: Off'}
                  </button>
                  
                  {/* Simplify Connections Toggle */}
                  <button
                    onClick={() => updateSettings({ simplifyConnections: !settings.simplifyConnections })}
                    className={`px-3 py-1 rounded text-sm transition-colors ${settings.simplifyConnections ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    title="Toggle animated connections"
                  >
                    {settings.simplifyConnections ? 'Simple Wires' : 'Animated Wires'}
                  </button>
                </>
              )}
            </div>
          )}
          {connectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 mb-4">No connectors added yet</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="bg-gray-800 text-green-400 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Add Connector
              </button>
            </div>
          ) : viewMode === 'canvas' ? (
            <div className="flex-grow min-h-0">
              <ReactFlowProvider>
                <ConnectorCanvas />
              </ReactFlowProvider>
            </div>
          ) : viewMode === 'diagram' ? (
            <div className="flex-grow min-h-0"> 
              <WiringDiagramPreview /> 
            </div>
          ) : viewMode === 'table' ? (
            <div className="flex-grow min-h-0"> 
              <TableView /> 
            </div>
          ) : null}
        </div>

        {/* Right sidebar - Details and Mappings */}
        <div className="md:col-span-1 bg-gray-950 border border-gray-800 rounded-lg flex flex-col overflow-hidden h-[850px]"> {/* Ensure this is a flex column and manages overflow, matches canvas height */}
          {/* Details Section */}
          <div className="p-4"> {/* Add padding here for Details content */}
            <h3 className="text-lg font-semibold text-green-400 mb-3">Details</h3>
            {selectedPin ? (
              <PinDetail /> // Reverted: PinDetail likely gets selectedPin from store
            ) : selectedConnector ? (
              <ConnectorDetail connector={selectedConnector} onEdit={() => handleEditConnector(selectedConnector!)} /> // Pass callback correctly
            ) : (
              <p className="text-gray-500 text-sm">Select a connector or pin to view details</p>
            )}
          </div>

          {/* Separator Line - Optional visual cue */}
          <hr className="border-gray-700 mx-4" />

          {/* Wire Mappings Section - Takes remaining space and handles its own scrolling via MappingList */}
          <div className="flex flex-col flex-grow min-h-0"> {/* This container will grow */}
            <h3 className="text-lg font-semibold text-green-400 pt-4 px-4 mb-3">Wire Mappings</h3> {/* Padding for title */}
            <div className="flex-grow min-h-0 px-4 pb-4"> {/* This div contains MappingList and allows it to take full height and scroll */}
              <MappingList filterConnectorId={selectedConnectorId} /> 
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Connector Builder - Render conditionally */}
      {showBuilder && (
        <Modal 
          onClose={handleCloseBuilder} // Use updated close handler
          title={editingConnector ? 'Edit Connector' : 'Connector Builder'} // Dynamic title
        >
          <ConnectorBuilder 
            connectorToEdit={editingConnector} // Pass connector data for editing
            onComplete={handleCloseBuilder} // Use updated close handler
          />
        </Modal>
      )}

    </div>
  );
};
````

## File: src/app/tools/wiremapper/components/WiringDiagramPreview.tsx
````typescript
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Mapping, Pin } from '../types';

// Layout Constants
const CONNECTOR_WIDTH = 230; // px
const CONNECTOR_HEADER_HEIGHT = 40; // Approximate px for name (p-2 + line height)
const CONNECTOR_TYPE_HEADER_HEIGHT = 25; // Approximate px for type (py-1 + line height)
const PIN_ROW_HEIGHT = 30; // px
const VERTICAL_GAP_BETWEEN_CONNECTORS = 40; // px
const HORIZONTAL_GAP_BETWEEN_COLUMNS = 100; // px, space for wires
const SVG_PADDING = 20; // px, padding around the entire diagram

interface ConnectorTableProps {
  connector: Connector;
  position: 'left' | 'right';
  usedPins: Set<string>;
  wireColors: Map<string, string>; // Map of pinId to wire color
  connectorIndex: number; // Index for positioning
  isLeftColumn: boolean;
}

// Component to render a single connector as a table
const ConnectorTable: React.FC<ConnectorTableProps> = ({
  connector,
  position,
  usedPins,
  wireColors,
}) => {
  // Only show pins that are used in mappings
  const connectorPins = connector.pins.filter(pin => 
    usedPins.has(`${connector.id}-${pin.pos}`)
  );

  // Sort pins by position
  const sortedPins = [...connectorPins].sort((a, b) => a.pos - b.pos);
  
  const tableStyle = {
    width: `${CONNECTOR_WIDTH}px`,
    backgroundColor: '#0F172A',
    borderRadius: '4px',
  };
  
  return (
    <div 
      style={tableStyle} 
      className="border border-gray-700 overflow-hidden"
      data-connector-id={connector.id}
    >
      {/* Connector Name */}
      <div 
        className="bg-gray-800 p-2 text-center font-mono text-green-400 border-b border-gray-700"
        style={{ height: `${CONNECTOR_HEADER_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {connector.name || 'Unknown'}
      </div>
      
      {/* Connector Type and Pin Count */}
      <div 
        className="text-center py-1 text-xs text-gray-400 border-b border-gray-700"
        style={{ height: `${CONNECTOR_TYPE_HEADER_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {connector.type || 'Unknown'} {connector.pins.length}-pin
      </div>
      
      {/* Pin Table */}
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {sortedPins.map((pin, index) => {
            const pinKey = `${connector.id}-${pin.pos}`;
            const color = wireColors.get(pinKey) || '#fff'; // Default to white if no color found
            const displayName = pin.name || `Pin ${pin.pos}`;
            const displayNet = pin.netName || 'Unnamed';
            
            const dataAttrs = {
              'data-pin-id': pinKey,
              'data-pin-index': index, // Visual index of displayed pins
              'data-pin-pos': pin.pos, // Original pin position number
              'data-connector-id': connector.id,
              'data-connector-position': position,
            };
            
            const commonCellStyle = {
              whiteSpace: 'nowrap' as 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 0, // Necessary for text-overflow to work in table cells
            };

            if (position === 'left') {
              return (
                <tr key={pin.id} className="border-b border-gray-700" style={{ height: `${PIN_ROW_HEIGHT}px` }}>
                  <td className="py-1 px-2 text-left" style={{ ...commonCellStyle, width: '40%' }}>
                    {displayName}
                  </td>
                  <td className="py-1 px-2 text-center text-gray-400" style={{ ...commonCellStyle, width: '35%' }}>
                    {displayNet}
                  </td>
                  <td 
                    className="py-1 px-2 text-right font-mono font-bold"
                    style={{ color, width: '25%' }}
                    {...dataAttrs}
                  >
                    {pin.pos}
                  </td>
                </tr>
              );
            } else { // right position
              return (
                <tr key={pin.id} className="border-b border-gray-700" style={{ height: `${PIN_ROW_HEIGHT}px` }}>
                  <td 
                    className="py-1 px-2 text-left font-mono font-bold"
                    style={{ color, width: '25%' }}
                    {...dataAttrs}
                  >
                    {pin.pos}
                  </td>
                  <td className="py-1 px-2" style={{ ...commonCellStyle, width: '40%' }}>
                    {displayName}
                  </td>
                  <td className="py-1 px-2 text-right text-gray-400" style={{ ...commonCellStyle, width: '35%' }}>
                    {displayNet}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

interface WireInfo {
  leftConnector: Connector;
  leftPin: Pin;
  rightConnector: Connector;
  rightPin: Pin;
  id: string;
  color: string;
}

export const WiringDiagramPreview: React.FC = () => {
  const { connectors, mappings } = useWireMapperStore();
  const diagramRef = useRef<HTMLDivElement>(null); // Ref for the main diagram container
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 });

  // Memoize processed connector and wire data
  const { 
    leftConnectorsWithPins, 
    rightConnectorsWithPins, 
    wireInfosProcessed, 
    usedPinIds, 
    wireColors 
  } = useMemo(() => {
    const connectionCount = new Map<string, number>();
    const usedPinIdsTemp = new Set<string>();
    const wireColorsMap = new Map<string, string>(); // Initialize here

    // Step 1: Populate connectionCount, usedPinIdsTemp, and wireColorsMap
    mappings.forEach(mapping => {
      connectionCount.set(mapping.source.connectorId, (connectionCount.get(mapping.source.connectorId) || 0) + 1);
      connectionCount.set(mapping.target.connectorId, (connectionCount.get(mapping.target.connectorId) || 0) + 1);
      usedPinIdsTemp.add(`${mapping.source.connectorId}-${mapping.source.pinPos}`);
      usedPinIdsTemp.add(`${mapping.target.connectorId}-${mapping.target.pinPos}`);

      const sourceConnFull = connectors.find(c => c.id === mapping.source.connectorId);
      const targetConnFull = connectors.find(c => c.id === mapping.target.connectorId);

      if (sourceConnFull && targetConnFull) {
        const sourcePinFull = sourceConnFull.pins.find(p => p.pos === mapping.source.pinPos);
        const targetPinFull = targetConnFull.pins.find(p => p.pos === mapping.target.pinPos);

        if (sourcePinFull && targetPinFull) {
          let chosenWireColor = sourcePinFull.config?.color;
          if (!chosenWireColor) {
            chosenWireColor = targetPinFull.config?.color;
          }
          if (!chosenWireColor) {
            chosenWireColor = '#888888'; // Default fallback color
          }
          wireColorsMap.set(`${sourceConnFull.id}-${sourcePinFull.pos}`, chosenWireColor);
          wireColorsMap.set(`${targetConnFull.id}-${targetPinFull.pos}`, chosenWireColor);
        }
      }
    });

    const sortedConnectors = [...connectors].sort((a, b) => (connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0));

    const left: Connector[] = [];
    const right: Connector[] = [];
    sortedConnectors.forEach((conn, i) => (i % 2 === 0 ? left.push(conn) : right.push(conn)));

    const getPins = (connector: Connector) => connector.pins
      .filter(pin => usedPinIdsTemp.has(`${connector.id}-${pin.pos}`))
      .sort((a, b) => a.pos - b.pos);

    const leftCWP = left.map(c => ({ ...c, pins: getPins(c) }));
    const rightCWP = right.map(c => ({ ...c, pins: getPins(c) }));

    // Step 2: Process mappings into wireInfosProcessed for L-R drawing, using populated wireColorsMap
    const processedWires = mappings.reduce((acc, mapping) => {
      const sourceConn = connectors.find(c => c.id === mapping.source.connectorId);
      const targetConn = connectors.find(c => c.id === mapping.target.connectorId);
      if (!sourceConn || !targetConn) return acc;

      const sourcePin = sourceConn.pins.find(p => p.pos === mapping.source.pinPos);
      const targetPin = targetConn.pins.find(p => p.pos === mapping.target.pinPos);
      if (!sourcePin || !targetPin) return acc;

      const sourceIsInLeftArray = left.some(c => c.id === sourceConn.id);
      const targetIsInLeftArray = left.some(c => c.id === targetConn.id);
      const sourceIsInRightArray = right.some(c => c.id === sourceConn.id);
      const targetIsInRightArray = right.some(c => c.id === targetConn.id);

      let trueLeftConnector: Connector, trueLeftPin: Pin;
      let trueRightConnector: Connector, trueRightPin: Pin;

      if (sourceIsInLeftArray && targetIsInRightArray) {
        // Standard L-R: Source is in left array, Target is in right array
        trueLeftConnector = sourceConn; trueLeftPin = sourcePin;
        trueRightConnector = targetConn; trueRightPin = targetPin;
      } else if (sourceIsInRightArray && targetIsInLeftArray) {
        // Standard R-L (swap to L-R): Source is in right array, Target is in left array
        trueLeftConnector = targetConn; trueLeftPin = targetPin;
        trueRightConnector = sourceConn; trueRightPin = sourcePin;
      } else {
        // Intra-column (L-L or R-R) or other unhandled cases (e.g. connector not in left or right array after distribution)
        return acc; // Skip this mapping for L-R diagram
      }
      
      // Get color from the fully populated map, using the original source/target of the mapping
      // as wireColorsMap is keyed by original pin identifiers.
      const wireColor = wireColorsMap.get(`${mapping.source.connectorId}-${mapping.source.pinPos}`) || 
                        wireColorsMap.get(`${mapping.target.connectorId}-${mapping.target.pinPos}`) || 
                        '#888888';

      acc.push({
        id: mapping.id,
        leftConnector: trueLeftConnector,
        leftPin: trueLeftPin,
        rightConnector: trueRightConnector,
        rightPin: trueRightPin,
        color: wireColor,
      });
      return acc;
    }, [] as WireInfo[]);

    return {
      leftConnectorsWithPins: leftCWP,
      rightConnectorsWithPins: rightCWP,
      wireInfosProcessed: processedWires,
      usedPinIds: usedPinIdsTemp,
      wireColors: wireColorsMap, // Pass the populated map
    };
  }, [connectors, mappings]);

  // Calculate dimensions for the SVG canvas and connector positions
  const { connectorPositions, diagramHeight, diagramWidth } = useMemo(() => {
    let currentLeftY = SVG_PADDING;
    let currentRightY = SVG_PADDING;
    const positions = new Map<string, { x: number; y: number; height: number }>();

    const calculateConnectorHeight = (connector: Connector) => {
      const numPins = connector.pins.filter(p => usedPinIds.has(`${connector.id}-${p.pos}`)).length;
      return CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (numPins * PIN_ROW_HEIGHT);
    };

    leftConnectorsWithPins.forEach(connector => {
      const height = calculateConnectorHeight(connector);
      positions.set(connector.id, { x: SVG_PADDING, y: currentLeftY, height });
      currentLeftY += height + VERTICAL_GAP_BETWEEN_CONNECTORS;
    });

    rightConnectorsWithPins.forEach(connector => {
      const height = calculateConnectorHeight(connector);
      // Position right connectors aligned with the calculated SVG width
      // Actual X is calculated later based on diagramWidth
      positions.set(connector.id, { x: 0, y: currentRightY, height }); // Placeholder X
      currentRightY += height + VERTICAL_GAP_BETWEEN_CONNECTORS;
    });

    const calculatedDiagramHeight = Math.max(currentLeftY, currentRightY) - VERTICAL_GAP_BETWEEN_CONNECTORS + SVG_PADDING;
    const calculatedDiagramWidth = (SVG_PADDING * 2) + (CONNECTOR_WIDTH * 2) + HORIZONTAL_GAP_BETWEEN_COLUMNS;

    // Update X for right connectors now that diagramWidth is known
    rightConnectorsWithPins.forEach(connector => {
      const pos = positions.get(connector.id);
      if (pos) {
        positions.set(connector.id, { ...pos, x: calculatedDiagramWidth - CONNECTOR_WIDTH - SVG_PADDING });
      }
    });

    return {
      connectorPositions: positions,
      diagramHeight: Math.max(300, calculatedDiagramHeight), // Minimum height
      diagramWidth: Math.max(600, calculatedDiagramWidth), // Minimum width
    };
  }, [leftConnectorsWithPins, rightConnectorsWithPins, usedPinIds]);

  useEffect(() => {
    setSvgDimensions({ width: diagramWidth, height: diagramHeight });
  }, [diagramWidth, diagramHeight]);


  const renderWires = () => {
    if (!diagramRef.current) return null;

    return wireInfosProcessed.map(wire => {
      const leftConnPos = connectorPositions.get(wire.leftConnector.id);
      const rightConnPos = connectorPositions.get(wire.rightConnector.id);

      if (!leftConnPos || !rightConnPos) return null;

      // Find the visual index of the pin *within the displayed (sorted and filtered) pins*
      const leftPinVisualIndex = leftConnectorsWithPins
        .find(c => c.id === wire.leftConnector.id)?.pins
        .findIndex(p => p.pos === wire.leftPin.pos) ?? -1;
      
      const rightPinVisualIndex = rightConnectorsWithPins
        .find(c => c.id === wire.rightConnector.id)?.pins
        .findIndex(p => p.pos === wire.rightPin.pos) ?? -1;

      if (leftPinVisualIndex === -1 || rightPinVisualIndex === -1) {
        console.warn('Could not find pin visual index for wire:', wire);
        return null;
      }

      const startX = leftConnPos.x + CONNECTOR_WIDTH;
      const leftPinY = leftConnPos.y +
                       1 + // Account for the top border of the ConnectorTable div
                       CONNECTOR_HEADER_HEIGHT +
                       CONNECTOR_TYPE_HEADER_HEIGHT +
                       (leftPinVisualIndex * PIN_ROW_HEIGHT) +
                       (PIN_ROW_HEIGHT / 2);

      const endX = rightConnPos.x;
      const rightPinY = rightConnPos.y +
                        1 + // Account for the top border of the ConnectorTable div
                        CONNECTOR_HEADER_HEIGHT +
                        CONNECTOR_TYPE_HEADER_HEIGHT +
                        (rightPinVisualIndex * PIN_ROW_HEIGHT) +
                        (PIN_ROW_HEIGHT / 2);

      const midX = (startX + endX) / 2;
      // Dynamic curve strength based on vertical distance
      const yDiff = Math.abs(rightPinY - leftPinY);
      let curveStrength = Math.min(yDiff / 1.5, HORIZONTAL_GAP_BETWEEN_COLUMNS / 1.5); // Increased curve strength
      curveStrength = Math.max(curveStrength, 30); // Minimum curve strength

      const pathD = `M ${startX} ${leftPinY} C ${midX - curveStrength} ${leftPinY}, ${midX + curveStrength} ${rightPinY}, ${endX} ${rightPinY}`;

      return (
        <path
          key={wire.id}
          d={pathD}
          stroke={wire.color}
          strokeWidth="2.5"
          fill="none"
        />
      );
    });
  };

  if (connectors.length === 0 || mappings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Add connectors and mappings to see the diagram.
      </div>
    );
  }
  
  return (
    <div ref={diagramRef} className="relative w-full h-full overflow-auto bg-gray-900 p-4">
      <div style={{ position: 'relative', width: `${svgDimensions.width}px`, height: `${svgDimensions.height}px` }}>
        {/* Left Connectors */}
        {leftConnectorsWithPins.map((connector) => {
          const pos = connectorPositions.get(connector.id);
          if (!pos) return null;
          return (
            <div
              key={connector.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${CONNECTOR_WIDTH}px`,
              }}
            >
              <ConnectorTable
                connector={connector}
                position="left"
                usedPins={usedPinIds}
                wireColors={wireColors}
                connectorIndex={0} // Not strictly needed now with absolute positioning
                isLeftColumn={true}
              />
            </div>
          );
        })}

        {/* Right Connectors */}
        {rightConnectorsWithPins.map((connector) => {
          const pos = connectorPositions.get(connector.id);
          if (!pos) return null;
          return (
            <div
              key={connector.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${CONNECTOR_WIDTH}px`,
              }}
            >
              <ConnectorTable
                connector={connector}
                position="right"
                usedPins={usedPinIds}
                wireColors={wireColors}
                connectorIndex={0} // Not strictly needed
                isLeftColumn={false}
              />
            </div>
          );
        })}
        
        {/* SVG for Wires */}
        <svg 
          width={svgDimensions.width}
          height={svgDimensions.height}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
        >
          <defs>
          </defs>
          <g>{renderWires()}</g>
        </svg>
      </div>
    </div>
  );
};

export default WiringDiagramPreview;
````

## File: src/app/tools/wiremapper/connectors/base/IConnectorRenderer.ts
````typescript
'use client';

import {
  Pin,
  ConnectorConfig,
  ConnectorShape,
  DynamicConfigSchema,
} from '../../types'; // Use the refined types

/**
 * Interface for connector rendering logic and configuration.
 */
export interface IConnectorRenderer {
  /**
   * The shape identifier for this renderer.
   */
  shape: ConnectorShape;

  /**
   * Gets the schema defining the configuration UI options for this shape.
   * Keys in the schema should match properties in ConnectorConfig.
   * @returns A DynamicConfigSchema object.
   */
  getConfigurationSchema(): DynamicConfigSchema;

  /**
   * Calculates the position of a specific pin relative to the connector's origin (top-left).
   *
   * @param pinIndex The 0-based index of the pin.
   * @param config The current connector configuration object.
   * @param dimensions The current calculated or default dimensions { width, height } of the connector preview.
   * @returns The { x, y } coordinates relative to the connector's top-left corner, or null if invalid.
   */
  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): { x: number; y: number } | null;

  /**
   * Generates the array of Pin objects based on the connector configuration.
   *
   * @param config The current connector configuration object.
   * @param dimensions The dimensions to use for calculating pin positions.
   * @returns An array of Pin objects.
   */
  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): Pin[];

  // --- Optional methods for potential future canvas rendering ---
  // render?(ctx: CanvasRenderingContext2D, connector: Connector, position: { x: number; y: number }, scale: number, isSelected: boolean, isHovered: boolean): void;
  // getBoundingBox?(connector: Connector, position: { x: number; y: number }, scale: number): { x: number; y: number; width: number; height: number };
  // getDisplayName?(): string; // Maybe useful for registry/UI
  // getShapeKey?(): string; // Implicitly handled by the 'shape' property now
  // getShapeSpecificProperties?(builderState: Partial<Connector>): Partial<Connector>; // Logic should be handled by builder using the config schema
}
````

## File: src/app/tools/wiremapper/connectors/CircleRenderer.ts
````typescript
'use client';

import { Pin, ConnectorConfig, ConnectorShape, DynamicConfigSchema } from '../types';
import { IConnectorRenderer } from './base/IConnectorRenderer';
import { generateUniqueId } from '../utils/generateUniqueId';

export class CircleRenderer implements IConnectorRenderer {
  shape: ConnectorShape = 'Circle';
  static displayName = 'Circle';

  getConfigurationSchema(): DynamicConfigSchema {
    return {
      numPins: {
        key: 'numPins',
        label: 'Number of Pins',
        type: 'number',
        defaultValue: 8,
        min: 1,
        max: 100,
        required: true,
      },
      pinNumberingStart: {
        key: 'pinNumberingStart',
        label: 'Pin 1 Position',
        type: 'radio',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Right', value: 'right' },
          { label: 'Bottom', value: 'bottom' },
          { label: 'Left', value: 'left' },
        ],
        defaultValue: 'top',
      },
    };
  }

  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): { x: number; y: number } | null {
    const { numPins = 1, pinNumberingStart = 'top' } = config;
    if (pinIndex >= numPins || pinIndex < 0) {
      return null;
    }
    if (dimensions.width <= 0 || dimensions.height <= 0) {
        return null;
    }
    const radius = Math.min(dimensions.width, dimensions.height) / 2.5;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    if (numPins <= 0) return null;
    const angleIncrement = (2 * Math.PI) / numPins;
    let startAngle = -Math.PI / 2;
    switch (pinNumberingStart) {
        case 'right': startAngle = 0; break;
        case 'bottom': startAngle = Math.PI / 2; break;
        case 'left': startAngle = Math.PI; break;
    }
    const angle = startAngle + pinIndex * angleIncrement;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
     if (isNaN(x) || isNaN(y)) {
        console.error(`NaN calculated for pin ${pinIndex}: Angle=${angle}, Center=(${centerX}, ${centerY}), Radius=${radius}`);
        return null;
    }
    return { x, y };
  }

  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): Pin[] {
    const { numPins = 1 } = config;
    const pins: Pin[] = [];
    if (dimensions.width <= 0 || dimensions.height <= 0) {
        console.warn('Cannot generate pins with invalid dimensions:', dimensions);
        return [];
    }
    for (let i = 0; i < numPins; i++) {
      const position = this.getPinPosition(i, config, dimensions);
      if (position) {
        pins.push({
          id: generateUniqueId(),
          index: i,
          name: `Pin ${i + 1}`,
          number: i + 1,
          x: position.x,
          y: position.y,
          config: {},
          connectedWireId: null,
          active: true,
          visible: true,
        });
      } else {
          console.warn(`Could not generate position for pin index ${i} with config:`, config);
      }
    }
    return pins;
  }
}
````

## File: src/app/tools/wiremapper/connectors/connectorRegistry.ts
````typescript
'use client';

import { IConnectorRenderer } from './base/IConnectorRenderer';
import { RectangleRenderer } from './RectangleRenderer';
import { CircleRenderer } from './CircleRenderer';
import { ConnectorShape } from '../types'; // Import ConnectorShape

// Create instances of all available renderers
const rectangleRenderer = new RectangleRenderer();
const circleRenderer = new CircleRenderer();

// Build the registry map using ConnectorShape as key
const rendererRegistry = new Map<ConnectorShape, IConnectorRenderer>();
rendererRegistry.set(rectangleRenderer.shape, rectangleRenderer); // Use .shape
rendererRegistry.set(circleRenderer.shape, circleRenderer); // Use .shape

// --- Registry Access Functions ---

/**
 * Retrieves a specific connector renderer instance by its shape enum value.
 * 
 * @param shape The ConnectorShape enum value.
 * @returns The corresponding IConnectorRenderer instance, or the default (Rectangle) if not found or shape is undefined.
 */
export const getRenderer = (shape: ConnectorShape | undefined): IConnectorRenderer => {
  // Default to rectangle if no shape is specified or if shape is not in registry
  const renderer = shape ? rendererRegistry.get(shape) : undefined;
  return renderer ?? rectangleRenderer;
};

/**
 * Retrieves the default connector renderer (Rectangle).
 */
export const getDefaultRenderer = (): IConnectorRenderer => {
  // Explicitly return the default renderer instance
  return rectangleRenderer; // Assuming rectangleRenderer is always the default
  // Or retrieve dynamically: return rendererRegistry.get(ConnectorShape.Rectangle)!;
};

/**
 * Gets a list of available connector shapes for UI selection.
 * Each item contains the shape enum value and a temporary display name.
 * TODO: Update to use a static displayName property from each renderer class.
 */
export const getAvailableShapes = (): { shape: ConnectorShape; displayName: string }[] => {
  return Array.from(rendererRegistry.values()).map(renderer => ({
    shape: renderer.shape,
    // Temporary display name - capitalize the enum key
    displayName: renderer.shape.charAt(0).toUpperCase() + renderer.shape.slice(1),
    // TODO: Replace above with: displayName: (renderer.constructor as any).displayName || renderer.shape
  }));
};

// Optionally export the map directly if needed, but functions are safer
// export { rendererRegistry };
````

## File: src/app/tools/wiremapper/connectors/RectangleRenderer.ts
````typescript
import {
  Pin,
  ConnectorConfig,
  DynamicConfigSchema,
  ConfigOption,
  PinNumberingMode,
  ConnectorShape,
} from '../types';
import { IConnectorRenderer } from './base/IConnectorRenderer';
import { CONNECTOR_DEFAULTS } from '../constants';
import { generateUniqueId } from '../utils/generateUniqueId'; // Corrected import path

// Define the available numbering modes
const PIN_NUMBERING_MODES: PinNumberingMode[] = [
  'sequential', // Left-to-right, top-to-bottom
  'row-col',    // R1C1, R1C2, ..., R2C1, ...
  'col-row',    // C1R1, C1R2, ..., C2R1, ...
];

// Helper to calculate pin number based on mode
function calculatePinNumber(
  globalPinIndex: number,
  config: ConnectorConfig,
  actualRows: number,
  pinLayout: number[]
): number | string {
  const { numberingMode = 'sequential', rows = 1, cols = 8 } = config;
  const pinIndex = globalPinIndex + 1; // 1-based index

  // If using pinPattern, complex numbering requires more logic (TODO)
  // For now, pattern implies sequential numbering regardless of mode selection
  if (pinLayout && pinLayout.length > 0 && pinLayout.length !== actualRows) { // Check if it's truly a custom pattern
    console.warn("Pin numbering for custom patterns is currently sequential only.")
    return pinIndex;
  }
  // Fallback to sequential if actualRows or pinLayout seem invalid
  if(actualRows <= 0 || !pinLayout || pinLayout.length === 0){
    return pinIndex;
  }

  // Determine current row and column based on pinLayout for standard grid checks
  let cumulativePins = 0;
  let currentRow = 0;
  let currentPinInRow = 0;
  for(let r = 0; r < actualRows; r++) {
    const pinsInThisRow = pinLayout[r] ?? 0;
    if (globalPinIndex < cumulativePins + pinsInThisRow) {
      currentRow = r;
      currentPinInRow = globalPinIndex - cumulativePins;
      break;
    }
    cumulativePins += pinsInThisRow;
  }

  const current_row_1_based = currentRow + 1;
  const current_col_1_based = currentPinInRow + 1;

  switch (numberingMode) {
    case 'row-col':
      return (current_row_1_based) * 100 + (current_col_1_based); // Example: R1C1 = 101
    case 'col-row':
      // Requires knowing the number of pins in the current column across all rows, complex with pattern
      return pinIndex; // Fallback to sequential for now
    case 'sequential':
    default:
      return pinIndex;
  }
}

export class RectangleRenderer implements IConnectorRenderer {
  shape: ConnectorShape = 'Rectangle'; // Assign string literal
  static readonly displayName = 'Rectangle';

  getConfigurationSchema(): DynamicConfigSchema {
    const configOptions: ConfigOption[] = [
      {
        key: 'rows',
        label: 'Rows',
        type: 'number',
        min: 1,
        max: 20, // Example max
        defaultValue: 1,
        disabledCondition: (config: ConnectorConfig) => !!config.pinPattern?.trim(), // Disable if pinPattern has value
        required: true,
        description: 'Number of rows. Used if Pin Pattern is not set.',
      },
      {
        key: 'cols',
        label: 'Columns',
        type: 'number',
        min: 1,
        max: 20, // Example max
        defaultValue: 8,
        disabledCondition: (config: ConnectorConfig) => !!config.pinPattern?.trim(), // Disable if pinPattern has value
        required: true,
        description: 'Number of columns per row, or max columns for Pin Pattern. Used if Pin Pattern is not set.',
      },
      {
        key: 'pinPattern',
        label: 'Pin Pattern (e.g., 8,6,6,7)',
        type: 'text',
        defaultValue: '',
        required: false,
        placeholder: 'Comma-separated pins per row. Overrides Rows/Cols.',
        description: 'Define exact pin counts for each row, comma-separated (e.g., 8,6,6,7). Overrides Rows and Columns inputs for pin layout.',
      },
      {
        key: 'centerPinsHorizontally',
        label: 'Center pins horizontally',
        type: 'boolean',
        defaultValue: true, // Default to true for better look
      },
      {
        key: 'pinNumberingMode',
        label: 'Pin Numbering Mode',
        type: 'radio',
        options: PIN_NUMBERING_MODES.map(mode => ({
          value: mode,
          label: mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' '), // Nicer labels
        })),
        defaultValue: 'sequential',
      },
    ];

    // Transform the array into the required DynamicConfigSchema object
    const schema: DynamicConfigSchema = {};
    for (const option of configOptions) {
      schema[option.key] = option;
    }
    return schema;
  }

  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number }
  ): Pin[] {
    const { rows = 1, cols = 8, pinPattern, centerPinsHorizontally = true } = config;
    const pins: Pin[] = [];
    let pinLayout: number[] = [];
    let totalPins = 0;
    let actualRows = rows;

    console.log(`Starting generatePins with config:`, { rows, cols, pinPattern });

    // Pin dimensions and spacing for pattern layout
    const pinSize = CONNECTOR_DEFAULTS.PIN_SIZE;
    const horizontalPinSpacing = 25; // Spacing between centers of pins horizontally
    const verticalPinSpacing = 25;   // Spacing between centers of pins vertically

    // Parse the pin pattern if available
    if (pinPattern && pinPattern.trim()) {
      console.log(`Parsing pin pattern: "${pinPattern}" typeof=${typeof pinPattern}`);
      
      // Simple split and parse approach for reliability
      const parts = pinPattern.trim().split(',');
      console.log(`  Split result (${parts.length} parts): "${parts.join('", "')}"`);
      
      // Convert string parts to numbers, filtering out invalid values
      const patternParts: number[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        const trimmed = parts[i].trim();
        const parsed = parseInt(trimmed, 10);
        
        if (!isNaN(parsed) && parsed > 0) {
          patternParts.push(parsed);
          console.log(`  Part ${i}: "${parts[i]}" => ${parsed} (valid)`);
        } else {
          console.log(`  Part ${i}: "${parts[i]}" => INVALID (${parsed})`);
        }
      }
      
      // Verify we have at least some valid parts
      const validPattern = patternParts.length > 0;
      console.log(`  Pattern valid? ${validPattern}, parts: [${patternParts.join(',')}]`);
      console.log(`  Number of rows to create: ${patternParts.length}`);

      // Add a special debug pattern check
      if (pinPattern === '3,3') {
        console.log(`  SPECIAL CASE: Pattern is exactly "3,3" which should create 2 rows with 3 pins each`);
      }
      
      if (validPattern && patternParts.length > 0) {
        // Valid pattern found
        pinLayout = patternParts;
        actualRows = pinLayout.length; // Number of rows = number of parts in pattern
        totalPins = pinLayout.reduce((sum, count) => sum + count, 0); // Total pins = sum of all numbers
        console.log(`  USING PIN PATTERN: [${pinLayout.join(',')}], rows=${actualRows}, totalPins=${totalPins}`);
        console.log(`  Pins per row: ${JSON.stringify(pinLayout)}`);
      } else {
        console.warn(`  Invalid pinPattern format: "${pinPattern}". Falling back to rows/cols.`);
        // Fallback to standard grid
        totalPins = rows * cols;
        pinLayout = Array(rows).fill(cols);
        actualRows = rows;
      }
    } else {
      // No pattern provided, use rows/cols
      console.log(`No pinPattern, using standard grid: ${rows} rows x ${cols} columns`);
      totalPins = rows * cols;
      pinLayout = Array(rows).fill(cols);
      actualRows = rows;
    }

    if (totalPins <= 0) {
      console.warn('No pins to generate (totalPins <= 0)');
      return [];
    }

    // Calculate positions
    let yPos = 15; // Initial Y position for the first row

    for (let r = 0; r < pinLayout.length; r++) {
      const pinsInThisRow = pinLayout[r];
      const rowWidth = (pinsInThisRow - 1) * horizontalPinSpacing;
      let xStart = (dimensions.width - rowWidth) / 2; // Centered by default

      if (!centerPinsHorizontally) {
        xStart = 15; // Align to left if not centering
      }

      for (let c = 0; c < pinsInThisRow; c++) {
        const xPos = xStart + c * horizontalPinSpacing;
        const globalPinIndex = pins.length;
        
        // Save the current indices for this pin (important for proper row assignment)
        const currentRow = r;
        const currentCol = c;
        
        // Generate a pin at this specific row and column
        console.log(`  Placing pin ${globalPinIndex} at row=${currentRow}, col=${currentCol}`);
        
        // Calculate pin number based on chosen numbering scheme
        const pinNumber = calculatePinNumber(globalPinIndex, config, actualRows, pinLayout);
        
        // Create the pin object with explicit row information in the name
        const pin: Pin = {
          id: generateUniqueId(),
          index: globalPinIndex,
          number: pinNumber, // User-facing number
          pos: typeof pinNumber === 'number' ? pinNumber : globalPinIndex + 1, // Logical position (use number if possible, else index+1)
          name: `Pin ${pinNumber} (r${currentRow}c${currentCol})`, // Include row/col in name for debugging
          row: currentRow, // Add the row property
          col: currentCol, // Add the col property
          x: xPos,
          y: yPos,
          connectedWireIds: [], // Update connectedWireId to connectedWireIds
          config: {},
          active: true,
        };
        
        console.log(`  ✅ Created pin ${globalPinIndex} at R${currentRow}C${currentCol}, pos=(${xPos}, ${yPos})`);
        pins.push(pin);
      }
      yPos += verticalPinSpacing; // Move to the next row, using the tighter spacing
    }
    
    console.log(`Generated ${pins.length} pins total`);
    return pins;
  }

  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
    pinLayoutParam?: number[] // Optional: pass parsed pinLayout from generatePins
  ): { x: number; y: number } | null {
    
    const { rows = 1, cols = 8, pinPattern, centerPinsHorizontally = true } = config;
    let pinLayout: number[] = [];
    if (pinPattern && pinPattern.trim()) {
      const parts = pinPattern.split(',').map((p: string) => parseInt(p.trim(), 10));
      if (parts.every((p: number) => !isNaN(p) && p > 0)) {
        pinLayout = parts;
      }
    }

    // Use pinLayoutParam if provided and valid, otherwise use parsed from pinPattern or default
    if (pinLayoutParam && pinLayoutParam.length > 0 && pinLayoutParam.every(p => p > 0)) {
      pinLayout = pinLayoutParam;
    } else if (pinLayout.length === 0) { // No valid pattern or param, use rows/cols default
      pinLayout = Array(rows).fill(cols);
    }

    const actualNumRows = pinLayout.length;

    // Pin dimensions and spacing
    const pinSize = CONNECTOR_DEFAULTS.PIN_SIZE;
    const horizontalPinSpacing = 12; // Spacing between centers of pins horizontally
    const verticalPinSpacing = 10;   // Spacing between centers of pins vertically
    const padding = 15;              // Padding from connector edges

    let pinsProcessed = 0;
    for (let r = 0; r < actualNumRows; r++) {
      const pinsInThisRow = pinLayout[r];
      if (pinIndex < pinsProcessed + pinsInThisRow) {
        const c = pinIndex - pinsProcessed;
        const rowWidth = (pinsInThisRow - 1) * horizontalPinSpacing;
        let xStart = (dimensions.width - rowWidth) / 2; // Centered by default

        if (!centerPinsHorizontally) {
          xStart = padding; // Align to left if not centering
        }

        const x = xStart + c * horizontalPinSpacing;
        const y = padding + r * verticalPinSpacing; // Pin center y

        return { x, y };
      }
      pinsProcessed += pinsInThisRow;
    }

    return null; // Pin index out of bounds
  }
}
````

## File: src/app/tools/wiremapper/lib/index.ts
````typescript
/**
 * Wire Mapper Utility Functions and Shared Logic
 */

import { nanoid } from 'nanoid';
import { Connector, WireMapperProject } from '../types';

/**
 * Generate a unique ID for connectors or mappings
 */
export const generateId = (): string => nanoid(8);

/**
 * Create a basic template for a connector based on rows and columns
 */
export const createConnectorTemplate = (
  name: string,
  type: string,
  rows: number,
  cols: number,
  gender: 'male' | 'female'
): Omit<Connector, 'id'> => {
  // Generate default pins
  const pins = Array.from({ length: rows * cols }).map((_, i) => ({
    pos: i + 1,
    name: `Pin ${i + 1}`,
    color: '#cccccc',
  }));

  // Create connector template
  return {
    name,
    type,
    rows,
    cols,
    gender,
    pins,
    position: {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      rotation: 0
    }
  };
};

/**
 * Export a project to a downloadable JSON file
 */
export const exportProject = (project: WireMapperProject) => {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName.replace(/\s+/g, '_')}_wiremapper.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
````

## File: src/app/tools/wiremapper/store/useWireMapperStore.ts
````typescript
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { produce } from 'immer'; // Use named import
import { 
  Connector, 
  Pin, 
  Mapping, 
  Wire, // Import Wire type
  WireMapperProject, 
  PinIdentifier, 
  AppMode, 
  WireMapperSettings 
} from '../types';

// Convert HSL to RGB then to hex color
const hslToHex = (h: number, s: number, l: number): string => {
  // Keep hue between 0-360
  h = h % 360;
  if (h < 0) h += 360;
  
  // Keep saturation and lightness as percentages
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  // Convert to hex
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Generate visually distinct colors based on existing colors
const getRandomHexColor = (existingColors: string[] = []): string => {
  // Minimum color distance in HSL space to ensure colors are visually distinct
  const MIN_HUE_DISTANCE = 30; // minimum degrees between hues
  const SATURATION = 80; // fixed high saturation for vibrant colors
  const LIGHTNESS = 60; // fixed lightness for good visibility on dark backgrounds
  
  // If no existing colors, start with a random hue
  if (existingColors.length === 0) {
    const hue = Math.floor(Math.random() * 360);
    return hslToHex(hue, SATURATION, LIGHTNESS);
  }
  
  // Extract existing hues
  const existingHues: number[] = [];
  
  // We'll use a simple approximation to extract hue from hex colors
  existingColors.forEach(hex => {
    if (hex === '#ffffff' || hex === '#FFFFFF') return; // Skip white
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // Approximate hue calculation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      const d = max - min;
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h *= 60;
    }
    
    existingHues.push(h);
  });
  
  // Find the largest gap in the hue circle
  existingHues.sort((a, b) => a - b);
  
  let maxGap = 360 - existingHues[existingHues.length - 1] + existingHues[0];
  let gapStart = existingHues[existingHues.length - 1];
  
  for (let i = 0; i < existingHues.length - 1; i++) {
    const gap = existingHues[i + 1] - existingHues[i];
    if (gap > maxGap) {
      maxGap = gap;
      gapStart = existingHues[i];
    }
  }
  
  // Place new hue in the middle of the largest gap
  const newHue = (gapStart + maxGap / 2) % 360;
  
  // If the gap is too small, shift the hue a bit to ensure distinction
  if (maxGap < MIN_HUE_DISTANCE) {
    // Pick a random offset between 15-45 degrees
    const offset = 15 + Math.floor(Math.random() * 30);
    return hslToHex((newHue + offset) % 360, SATURATION, LIGHTNESS);
  }
  
  return hslToHex(newHue, SATURATION, LIGHTNESS);
};

// Helper to create a Wire object from a Mapping and its Pins
const _createWireFromMapping = (mapping: Mapping, sourcePin: Pin, targetPin: Pin): Wire | null => {
  // Basic validation
  if (!sourcePin || !targetPin) {
    console.error("Cannot create wire: missing source or target pin.");
    return null;
  }
  
  // Construct the wire object
  const wire: Wire = {
    id: mapping.wireId,
    source: {
      connectorId: mapping.source.connectorId,
      pinPos: sourcePin.pos, // Use pos for consistency
    },
    target: {
      connectorId: mapping.target.connectorId,
      pinPos: targetPin.pos, // Use pos for consistency
    },
    color: mapping.color || '#888888', // Use mapping color or default
    thickness: 1, // Default thickness, removed mapping.thickness
    label: mapping.netName || '', // Use netName from mapping as label
    // Add other wire properties as needed
  };
  
  return wire;
};

// Define a type for the copied net info
type CopiedNetInfo = {
  netName?: string;
  netColor?: string;
  voltage?: string;
  signalType?: string;
};

interface WireMapperState {
  projectName: string;
  connectors: Connector[];
  mappings: Mapping[];
  wires: Wire[];
  selectedPin: PinIdentifier | null;
  selectedConnectorId: string | null;
  focusedWireId: string | null; // Add focused wire state
  copiedNet: CopiedNetInfo | null; // For copy/paste net functionality
  settings: WireMapperSettings;
  
  // Project actions
  setProjectName: (name: string) => void;
  loadProject: (project: WireMapperProject) => void;
  saveProject: () => WireMapperProject;
  clearProject: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<WireMapperSettings>) => void;
  setMode: (mode: AppMode) => void;

  // Connector actions
  addConnector: (connectorData: Omit<Connector, 'id'>) => string;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  removeConnector: (id: string) => void;
  duplicateConnector: (connectorId: string) => void; // Added duplicateConnector
  setSelectedConnector: (connectorId: string | null) => void;
  updateConnectorPosition: (id: string, x: number, y: number) => void;
  rotateConnector: (id: string, rotation: number) => void;
  
  // Pin actions
  updatePin: (connectorId: string, pinPos: number, updates: Partial<Pin>) => void;
  updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netNameProp?: string) => void;
  setSelectedPin: (connectorId: string | null, pinPos: number | null) => void;
  clearPinSelection: () => void;
  isPinConnected: (pinPos: number, connectorId: string) => boolean;
  setSelectedConnectorId: (id: string | null) => void;
  
  // Mapping actions
  addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => void;
  updateMapping: (id: string, updates: Partial<Omit<Mapping, 'id' | 'wireId'>>) => void;
  removeMapping: (id: string) => void;
  setFocusedWireId: (id: string | null) => void; // Add setFocusedWireId action
  setCopiedNet: (copiedNet: CopiedNetInfo | null) => void; // Add setCopiedNet action
  copyNetFromPin: (connectorId: string, pinPos: number) => void;
  pasteNetToPin: (connectorId: string, pinPos: number) => void;
  resetPin: (connectorId: string, pinPos: number) => void; // Add resetPin action
}

export const useWireMapperStore = create<WireMapperState>((set, get) => {

  // Helper to disconnect a pin and remove its associated mapping/wire
  const _disconnectPin = (wireIdToRemove: string, draft: WireMapperState): boolean => {
    console.log(`[_disconnectPin] Start: Removing connection for wireId ${wireIdToRemove}`);

    // Find the mapping and wire to remove
    const mappingIndex = draft.mappings.findIndex(m => m.wireId === wireIdToRemove);
    const wireIndex = draft.wires.findIndex(w => w.id === wireIdToRemove);

    // Handle case where the mapping is missing (data inconsistency).
    if (mappingIndex === -1) {
      console.warn(`[_disconnectPin] Mapping not found for wireId ${wireIdToRemove}.`);
      // Attempt to remove the wire anyway if it exists, as it's now orphaned.
      if (wireIndex !== -1) {
        console.log(`[_disconnectPin] Removing orphaned wire ${wireIdToRemove}.`);
        draft.wires.splice(wireIndex, 1);
      }
      return false; // Indicate failure
    }

    // Get the mapping before removing it
    const mapping = draft.mappings[mappingIndex];

    console.log(`[_disconnectPin] Removing mapping index ${mappingIndex} for wire ${wireIdToRemove}.`);
    draft.mappings.splice(mappingIndex, 1);

    // Find and remove the associated wire.
    if (wireIndex !== -1) {
      console.log(`[_disconnectPin] Found wire index ${wireIndex} for wireId ${wireIdToRemove}. Removing wire.`);
      draft.wires.splice(wireIndex, 1);
    } else {
      console.warn(`[_disconnectPin] Wire object ${wireIdToRemove} not found for removed mapping.`);
    }

    // --- Disconnect BOTH pins involved in the removed mapping --- 
    const pinsToUpdate: PinIdentifier[] = [mapping.source, mapping.target];
    pinsToUpdate.forEach(pinIdentifier => {
      const connector = draft.connectors.find(c => c.id === pinIdentifier.connectorId);
      const pin = connector?.pins.find(p => p.pos === pinIdentifier.pinPos);
      if (pin) {
        const index = pin.connectedWireIds.indexOf(wireIdToRemove);
        if (index > -1) {
          pin.connectedWireIds.splice(index, 1); // Remove the specific wire ID
          console.log(`[_disconnectPin] Removed wire ${wireIdToRemove} from pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos}. Remaining: [${pin.connectedWireIds.join(', ')}]`);

          // If this was the last connection, clear the net name and set pin.config.color to undefined
          if (pin.connectedWireIds.length === 0) {
            pin.netName = undefined;
            pin.config.color = undefined; // Explicitly set to undefined to remove override
            console.log(`[_disconnectPin] Pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos} has no connections left. Cleared netName and set color to undefined.`);
          }
        } else {
          console.warn(`[_disconnectPin] Wire ${wireIdToRemove} not found in connectedWireIds of pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos}`);
        }
      } else {
        console.warn(`[_disconnectPin] Pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos} not found while trying to remove wire ${wireIdToRemove}.`);
      }
    });

    console.log(`[_disconnectPin] END: Finished removing connection for wireId ${wireIdToRemove}.`);
    return true; // Indicate success
  };

  // Helper function to propagate color and net name updates through a connected net
  const _propagateNetUpdates = (
    startPinIdentifier: PinIdentifier,
    newColor: string | undefined, // The new color to apply (can be undefined to clear)
    newNetName: string | undefined, // The new net name to apply (can be undefined to clear)
    draft: WireMapperState
  ) => {
    console.log(`[_propagateNetUpdates] START: Propagating from ${startPinIdentifier.connectorId}-${startPinIdentifier.pinPos} with Color=${newColor}, NetName=${newNetName}`);
    const queue: PinIdentifier[] = [startPinIdentifier];
    const visitedPins = new Set<string>(); // Keep track of visited pins (connectorId-pinPos)

    while (queue.length > 0) {
      const currentPinIdentifier = queue.shift()!;
      const visitedKey = `${currentPinIdentifier.connectorId}-${currentPinIdentifier.pinPos}`;

      if (visitedPins.has(visitedKey)) {
        console.log(`[_propagateNetUpdates] Pin ${visitedKey} already visited. Skipping.`);
        continue;
      }
      visitedPins.add(visitedKey);
      console.log(`[_propagateNetUpdates] Visiting pin ${visitedKey}`);

      const connector = draft.connectors.find(c => c.id === currentPinIdentifier.connectorId);
      const pin = connector?.pins.find(p => p.pos === currentPinIdentifier.pinPos);

      if (!pin) {
        console.warn(`[_propagateNetUpdates] Pin ${visitedKey} not found during propagation. Skipping.`);
        continue;
      }

      // Update the current pin's color and netName
      pin.config.color = newColor;
      pin.netName = newNetName; // Assign the net name (can be undefined)
      console.log(`[_propagateNetUpdates] Updated pin ${visitedKey}: Color=${pin.config.color}, NetName=${pin.netName}`);

      // If the pin has no connections, stop traversal for this branch
      if (!pin.connectedWireIds || pin.connectedWireIds.length === 0) {
        console.log(`[_propagateNetUpdates] Pin ${visitedKey} has no connections. Stopping traversal for this branch.`);
        continue;
      }

      // Iterate through ALL connected wires for the current pin
      for (const wireId of pin.connectedWireIds) {
        console.log(`[_propagateNetUpdates] Processing connection via wire ${wireId} for pin ${visitedKey}`);

        // Update the mapping associated with this wireId
        const mapping = draft.mappings.find(m => m.wireId === wireId);
        if (mapping) {
          console.log(`[_propagateNetUpdates] Found mapping ${mapping.id} for wire ${wireId}. Updating its color/netName.`);
          mapping.color = newColor;
          mapping.netName = newNetName;

          // Update the wire associated with this wireId
          const wire = draft.wires.find(w => w.id === wireId);
          if (wire) {
            console.log(`[_propagateNetUpdates] Found wire ${wire.id}. Updating its color.`);
            const effectiveWireColor = newColor ?? get().settings.defaultWireColor ?? '#ffffff'; // Ensure string
            wire.color = effectiveWireColor; // Assign the guaranteed string color
          } else {
            console.warn(`[_propagateNetUpdates] Wire object not found for wireId ${wireId} (mapping ${mapping.id}) during propagation`);
          }

          // Find the *other* pin connected by this mapping
          const otherPinIdentifier = 
              mapping.source.connectorId === currentPinIdentifier.connectorId && mapping.source.pinPos === currentPinIdentifier.pinPos
                  ? mapping.target
                  : mapping.source;

          const nextVisitedKey = `${otherPinIdentifier.connectorId}-${otherPinIdentifier.pinPos}`;

          // Queue the other pin for processing if not already visited
          if (!visitedPins.has(nextVisitedKey)) {
            console.log(`[_propagateNetUpdates] Queuing next pin ${nextVisitedKey} from mapping ${mapping.id}`);
            queue.push(otherPinIdentifier);
          } else {
            console.log(`[_propagateNetUpdates] Next pin ${nextVisitedKey} already visited/queued.`);
          }
        } else {
          console.warn(`[_propagateNetUpdates] Mapping object not found for pin ${visitedKey} (wireId: ${wireId}) during propagation`);
        }
      }
    }
    console.log(`[_propagateNetUpdates] END: Finished propagation starting from ${startPinIdentifier.connectorId}-${startPinIdentifier.pinPos}`);
  };

   // --- Return the store state and actions ---
   return {
     projectName: 'New Harness',
     connectors: [],
     mappings: [],
     wires: [], // Initialize wires array
     selectedPin: null,
     selectedConnectorId: null,
     focusedWireId: null, // Initialize focused wire as null
     copiedNet: null, // Initialize copied net as null
     settings: {
       connectionMode: 'normal', // Renamed from mode for clarity
       namePosition: 'above',
       simplifyConnections: true,
       snapToGrid: true,
       showGrid: true,
       gridSize: 20,
       defaultWireColor: '#ffffff', // Default wire color
       darkMode: true,
       showWires: true, // Added control for wire visibility
     },
     
     // Project actions
     setProjectName: (name: string) => set({ projectName: name }),
     
     loadProject: (project: WireMapperProject) => set({
       projectName: project.projectName,
       connectors: project.connectors,
       mappings: project.mappings,
       selectedPin: null
     }),
     
     saveProject: () => {
       const { projectName, connectors, mappings } = get();
       return { projectName, connectors, mappings };
     },
     
     // Settings actions
     updateSettings: (settings: Partial<WireMapperSettings>) => set(state => ({
       settings: { ...state.settings, ...settings }
     })),
     
     setMode: (mode: AppMode) => set(state => ({
       settings: { ...state.settings, mode }
     })),
     
     clearProject: () => {
       // Clear localStorage - use the correct keys
       if (typeof window !== 'undefined') {
         localStorage.removeItem('wireMapperProject');
         localStorage.removeItem('wireMapperSettings');
       }
       
       // Reset state
       set({
         projectName: 'New Harness',
         connectors: [],
         mappings: [],
         selectedPin: null
       });
     },
     
     // Connector actions
     addConnector: (connectorData: Omit<Connector, 'id'>) => {
       const id = nanoid();
       set((state: WireMapperState) => {
         // Calculate actual rows and columns based on pinPattern or provided values
         let actualRows = connectorData.rows ?? 1;
         let actualCols = connectorData.cols ?? 1;
         const pinPattern = connectorData.config?.pinPattern?.trim();

         if (pinPattern) {
           try {
             const patternParts = pinPattern.split(',').map((p: string) => parseInt(p.trim(), 10));
             if (patternParts.length > 0 && patternParts.every((p: number) => !isNaN(p) && p > 0)) {
               actualRows = patternParts.length;
               actualCols = Math.max(...patternParts);
               console.log(`[Store] Using pinPattern: ${pinPattern}. Calculated rows=${actualRows}, cols=${actualCols}`);
             } else {
               console.warn(`[Store] Invalid pinPattern format: "${pinPattern}". Falling back to rows/cols.`);
             }
           } catch (error) {
             console.error(`[Store] Error parsing pinPattern: "${pinPattern}"`, error);
           }
         }
          
          // Create default pins with all required fields if none are provided
          const pins = (connectorData.pins && connectorData.pins.length > 0) 
            ? connectorData.pins 
            : Array(actualRows * actualCols) // Generate default based on actual calculated dimensions
                .fill(0)
                .map((_, i): Pin => ({
                  id: nanoid(), // Assign unique ID to each pin
                  index: i,     // 0-based index
                  number: i + 1, // Display number (1-based)
                  pos: i + 1,   // Logical position (1-based)
                  name: `Pin ${i + 1}`,
                  row: Math.floor(i / actualCols), // Calculate row based on actualCols
                  col: i % actualCols,             // Calculate col based on actualCols
                  x: 0, // Placeholder X (Renderer should calculate actual)
                  y: 0, // Placeholder Y (Renderer should calculate actual)
                  connectedWireIds: [], // Initialize as empty array
                  config: {},
                  active: true,
                  visible: true,
                }));
        
        return {
          connectors: [
            ...state.connectors,
            {
              ...connectorData,
              rows: actualRows, // Use calculated rows
              cols: actualCols, // Use calculated cols
              x: connectorData.x ?? 100, // Use provided x or default
              y: connectorData.y ?? 100, // Use provided y or default
              pins, // Ensure pins are included (either provided or generated)
              id,
            }
          ]
        };
      });
      return id;
    },
    
    updateConnector: (id: string, updates: Partial<Connector>) => set((state: WireMapperState) => ({
      connectors: state.connectors.map((c: Connector) => 
        c.id === id ? { ...c, ...updates } : c
      )
    })),
    
    removeConnector: (id: string) => set((state: WireMapperState) => {
      // Also remove mappings connected to this connector
      const updatedMappings = state.mappings.filter(m => 
        m.source.connectorId !== id && m.target.connectorId !== id
      );
      // Also remove wires connected to this connector
      const updatedWires = state.wires.filter(w => 
        w.source.connectorId !== id && w.target.connectorId !== id
      );
      return {
        connectors: state.connectors.filter(c => c.id !== id),
        mappings: updatedMappings,
        wires: updatedWires,
        selectedConnectorId: state.selectedConnectorId === id ? null : state.selectedConnectorId,
        selectedPin: state.selectedPin?.connectorId === id ? null : state.selectedPin,
      };
    }),
    
    duplicateConnector: (connectorId: string) => set((state: WireMapperState) => {
      const originalConnector = state.connectors.find(c => c.id === connectorId);
      if (!originalConnector) {
        console.error(`[Store] Connector not found for duplication: ${connectorId}`);
        return state; // Return current state if connector not found
      }

      // Generate a new name for the duplicated connector
      let newName = `${originalConnector.name}-copy`;
      let counter = 2;
      const existingNames = state.connectors.map(c => c.name);
      while (existingNames.includes(newName)) {
        newName = `${originalConnector.name}-copy-${counter}`;
        counter++;
      }

      const newConnector: Connector = {
        // Deep copy all properties from the original connector as a base.
        // This includes width, height, shape, type, gender, metadata, etc.
        ...(JSON.parse(JSON.stringify(originalConnector))),
        
        // Override specific properties for the new duplicated connector
        id: nanoid(), // New unique ID for the connector itself
        name: newName,
        x: (originalConnector.x ?? 0) + 30, // Ensure x/y are numbers before adding offset, default to 0 if undefined
        y: (originalConnector.y ?? 0) + 30,
        
        // Explicitly ensure rows and cols are carried over or defaulted to 1.
        // ConnectorNode.tsx also defaults these to 1 if undefined.
        rows: originalConnector.rows ?? 1,
        cols: originalConnector.cols ?? 1,

        // Deep copy config, ensuring it's an object even if originalConnector.config was undefined.
        config: originalConnector.config ? JSON.parse(JSON.stringify(originalConnector.config)) : {},

        // Create new pins based on original pins, but with new IDs and preserving all data properties
        pins: originalConnector.pins.map(originalPin => {
          return {
            // Required properties
            id: nanoid(),                  // New unique ID for the new pin
            index: originalPin.index,     // Copy original index
            pos: originalPin.pos,         // Copy position index
            name: originalPin.name,       // Copy name
            x: originalPin.x,             // Copy x position
            y: originalPin.y,             // Copy y position
            connectedWireIds: [],         // Reset connections (don't copy) 
            config: originalPin.config ? JSON.parse(JSON.stringify(originalPin.config)) : {}, // Deep clone config
            active: originalPin.active,   // Copy active state
            
            // Copy optional properties if they exist
            ...(originalPin.number !== undefined && { number: originalPin.number }),
            ...(originalPin.visible !== undefined && { visible: originalPin.visible }),
            ...(originalPin.row !== undefined && { row: originalPin.row }),
            ...(originalPin.col !== undefined && { col: originalPin.col }),
            
            // Copy net-related properties
            ...(originalPin.netName !== undefined && { netName: originalPin.netName }),
            ...(originalPin.netColor !== undefined && { netColor: originalPin.netColor }),
            ...(originalPin.desc !== undefined && { desc: originalPin.desc }),
            ...(originalPin.voltage !== undefined && { voltage: originalPin.voltage }),
            ...(originalPin.signalType !== undefined && { signalType: originalPin.signalType })
          };
        })
      };

      return {
        connectors: [...state.connectors, newConnector],
      };
    }),
    
    setSelectedConnector: (connectorId: string | null) => set((state) => {
      return {
        selectedConnectorId: connectorId,
        selectedPin: null, // Deselect pin when selecting a connector
      };
    }),
    
    updateConnectorPosition: (id: string, x: number, y: number) => set((state: WireMapperState) => ({
      connectors: state.connectors.map((c: Connector) => 
        c.id === id ? { 
          ...c, 
          // Update top-level x and y
          x: x, 
          y: y  
        } : c
      )
    })),
    
    rotateConnector: (id: string, rotation: number) => set((state: WireMapperState) => ({
      connectors: state.connectors.map((c: Connector) => 
        c.id === id ? { ...c, rotation } : c
      )
    })),
    
    // Pin actions
    updatePin: (connectorId: string, pinPos: number, updates: Partial<Pin>) => set((state: WireMapperState) => ({
      connectors: state.connectors.map((c) => 
        c.id === connectorId ? {
          ...c,
          pins: c.pins.map((p: Pin) => 
            p.pos === pinPos ? { ...p, ...updates } : p
          )
        } : c
      )
    })),
    
    updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netNameProp?: string) => {
      console.log(`[updatePinDetailsAndNet] START: Updating pin ${connectorId}-${pinPos} with`, updates);
      set(produce((draft: WireMapperState) => {
        const connector = draft.connectors.find((c: Connector) => c.id === connectorId);
        if (!connector) { console.error(`Connector ${connectorId} not found`); return; }
        const pin = connector.pins.find((p: Pin) => p.pos === pinPos);
        if (!pin) { console.error(`Pin ${pinPos} on connector ${connectorId} not found`); return; }

        // Apply direct updates to the pin
        // Handle pin name update
        if (updates.name !== undefined) {
            console.log(`[updatePinDetailsAndNet] Updating pin name to: ${updates.name}`);
            pin.name = updates.name; // Directly update the pin's name
        }
        // Handle pin config update (color, etc.)
        if(updates.config) {
            pin.config = { ...(pin.config || {}), ...updates.config };
        }

        // Determine the target netName (passed prop > updates object > existing pin value)
        let targetNetName = netNameProp !== undefined ? netNameProp : (updates.netName !== undefined ? updates.netName : pin.netName);

        // --- Net Name Validation for UNCONNECTED pins --- 
        let allowNetNameUpdate = true;
        if (pin.connectedWireIds.length === 0 && targetNetName) { // Only validate if unconnected and setting a name
          console.log(`[updatePinDetailsAndNet] Pin ${connectorId}-${pinPos} is unconnected. Validating target net name: ${targetNetName}`);
          for (const otherConnector of draft.connectors) {
            for (const otherPin of otherConnector.pins) {
              // Skip self-comparison
              if (otherConnector.id === connectorId && otherPin.pos === pinPos) continue;

              // Check if other pin is also unconnected and has the target net name
              if (otherPin.connectedWireIds.length === 0 && otherPin.netName === targetNetName) {
                console.warn(`[updatePinDetailsAndNet] Validation FAILED: Unconnected pin ${otherConnector.id}-${otherPin.pos} already has net name '${targetNetName}'. Cannot assign to ${connectorId}-${pinPos}.`);
                allowNetNameUpdate = false;
                break; // Stop checking once a duplicate is found
              }
            }
            if (!allowNetNameUpdate) break; // Stop checking connectors too
          }
        }

        // Update the pin's netName only if validation passed or pin is connected/name is being cleared
        if (allowNetNameUpdate) {
            console.log(`[updatePinDetailsAndNet] Validation passed or not required. Updating net name for ${connectorId}-${pinPos} to: ${targetNetName}`);
            pin.netName = targetNetName;
        } else {
             console.log(`[updatePinDetailsAndNet] Keeping original net name for ${connectorId}-${pinPos} due to validation failure.`);
            // Optionally, revert targetNetName if needed elsewhere, though pin.netName is the source of truth now.
            targetNetName = pin.netName; // Keep the original value consistent
        }

        // Get the potentially updated color from the pin's config AFTER applying updates
        const newColor = pin.config?.color; // Can be undefined

        // If the pin is part of a net, propagate the updates
        if (pin.connectedWireIds.length) {
            const netNameToPropagate = pin.netName; // Use the potentially updated name
            console.log(`[updatePinDetailsAndNet] Pin is connected. Calling _propagateNetUpdates with Color=${newColor}, NetName=${netNameToPropagate}`);
            _propagateNetUpdates({ connectorId, pinPos }, newColor, netNameToPropagate, draft);
        } else {
            console.log(`[updatePinDetailsAndNet] Pin is not connected. Skipping propagation.`);
            // If not connected, still ensure its own color is set if provided in updates
            if (updates.config?.color !== undefined) {
                pin.config.color = updates.config.color;
            }
        }
      }));
      console.log(`[updatePinDetailsAndNet] END: Finished update for pin ${connectorId}-${pinPos}`);
    },

    setSelectedPin: (connectorId: string | null, pinPos: number | null) => set({ // Added types
       selectedPin: connectorId && pinPos !== null ? { connectorId, pinPos } : null,
       // Deselect connector when selecting a pin
       selectedConnectorId: null,
     }),
    
    clearPinSelection: () => set({ selectedPin: null }),
    
    isPinConnected: (pinPos: number, connectorId: string) => {
       const mappings = get().mappings;
       return mappings.some(
         m =>
          (m.source.connectorId === connectorId && m.source.pinPos === pinPos) ||
          (m.target.connectorId === connectorId && m.target.pinPos === pinPos)
       );
    },
    
    setSelectedConnectorId: (id: string | null) => set({ selectedConnectorId: id, selectedPin: null }), // Added type

    // Set the focused wire - when set, only this wire/net will be displayed
    setFocusedWireId: (id: string | null) => set((state) => {
      return {
        focusedWireId: id,
        // Deselect connector and pin when setting focused wire
        selectedConnectorId: null,
        selectedPin: null,
      };
    }),

    // For copy/paste net functionality
    setCopiedNet: (netInfo: CopiedNetInfo | null) => set({
      copiedNet: netInfo
    }),
    
    // Copy net info from a specific pin
    copyNetFromPin: (connectorId: string, pinPos: number) => {
      const state = get();
      const connector = state.connectors.find(c => c.id === connectorId);
      if (!connector) return;
      
      const pin = connector.pins.find(p => p.pos === pinPos);
      if (!pin) return;
      
      // Extract net-related info from the pin
      const copiedNet: CopiedNetInfo = {
        netName: pin.netName,
        netColor: typeof pin.config?.color === 'string' ? pin.config.color : undefined, // Ensure color is a string
        voltage: typeof pin.voltage === 'string' ? pin.voltage : pin.voltage?.toString(), // Convert to string if it's a number
        signalType: pin.signalType
      };
      
      console.log("Copied net info:", copiedNet);
      set({ copiedNet });
    },
    
    // Paste copied net info to a specific pin
    pasteNetToPin: (connectorId: string, pinPos: number) => {
      const state = get();
      if (!state.copiedNet) return; // Nothing to paste
      
      // Create an update object that properly synchronizes netColor with config.color
      const updates = {
        ...state.copiedNet,
        // Ensure the pin.config.color is also updated with the netColor if available
        config: {
          color: state.copiedNet.netColor // Use netColor for the pin color
        }
      };
      
      console.log('Pasting net to pin with updates:', updates);
      
      // Update the pin with the copied net info
      const { updatePin } = get();
      updatePin(connectorId, pinPos, updates);
      
      // Clear the copiedNet after pasting to exit paste mode
      // This ensures the paste mode visual indicators are cleared
      setTimeout(() => {
        const { setCopiedNet } = get();
        setCopiedNet(null);
      }, 100); // Small delay to ensure the update completes first
    },
    
    // Reset a pin to its default state (clear net information and remove connections)
    resetPin: (connectorId: string, pinPos: number) => {
      console.log(`Resetting pin ${connectorId}-${pinPos}`);
      
      const state = get();
      
      // Find the connector and pin
      const connector = state.connectors.find(c => c.id === connectorId);
      if (!connector) return;
      
      const pin = connector.pins.find(p => p.pos === pinPos);
      if (!pin) return;
      
      // First, check if the pin has any connections
      if (pin.connectedWireIds && pin.connectedWireIds.length > 0) {
        // Store wire IDs that need to be removed
        const wireIdsToRemove = [...pin.connectedWireIds];
        
        // For each wire, find and remove the corresponding mapping
        wireIdsToRemove.forEach(wireId => {
          const mapping = state.mappings.find(m => m.wireId === wireId);
          if (mapping) {
            // Remove the mapping using the existing removeMapping action
            state.removeMapping(mapping.id);
          }
        });
      }
      
      // Create an update object that clears all net-related information
      const resetUpdates = {
        netName: undefined,
        netColor: undefined,
        voltage: undefined,
        signalType: undefined,
        config: {
          color: undefined // Clear the pin color
        },
        connectedWireIds: [] // Clear connections
      };
      
      // Update the pin with the reset values
      const { updatePin } = get();
      updatePin(connectorId, pinPos, resetUpdates);
    },

    // Mapping actions
    addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => set(produce((draft: WireMapperState) => {
      console.log(`[addMapping] Start: Source=${newMapping.source.connectorId}-${newMapping.source.pinPos}, Target=${newMapping.target.connectorId}-${newMapping.target.pinPos}`);

// ... (rest of the code remains the same)
       // 1. Disconnect existing connections if pins are already mapped // <-- REMOVING THIS BEHAVIOR
       /*
        if (newMapping.source.connectorId && newMapping.source.pinPos) {
          const sourcePinCheck = draft.connectors.find(c => c.id === newMapping.source.connectorId)?.pins.find(p => p.pos === newMapping.source.pinPos);
          if (sourcePinCheck?.connectedWireId) {
            console.log(`[addMapping] Source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} already connected to wire ${sourcePinCheck.connectedWireId}. Disconnecting old mapping.`);
            _disconnectPin(newMapping.source, draft); // Disconnect source
          } else {
            console.log(`[addMapping] Source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} is not connected.`);
          }
        }
        if (newMapping.target.connectorId && newMapping.target.pinPos) {
          const targetPinCheck = draft.connectors.find(c => c.id === newMapping.target.connectorId)?.pins.find(p => p.pos === newMapping.target.pinPos);
          if (targetPinCheck?.connectedWireId) {
            console.log(`[addMapping] Target pin ${newMapping.target.connectorId}-${newMapping.target.pinPos} already connected to wire ${targetPinCheck.connectedWireId}. Disconnecting old mapping.`);
            _disconnectPin(newMapping.target, draft); // Disconnect target
          } else {
            console.log(`[addMapping] Target pin ${newMapping.target.connectorId}-${newMapping.target.pinPos} is not connected.`);
          }
        }
       */
 
        // 2. Determine the authoritative color and netName for the new connection
        // Priority: Source Pin > Target Pin (if source has no specific values) > Default
        // Note: The check for existing connection was moved above, so we don't need to check here.
        const sourcePinState = draft.connectors.find(c => c.id === newMapping.source.connectorId)?.pins.find(p => p.pos === newMapping.source.pinPos);
        const sourceColor = sourcePinState?.config?.color;
        const sourceNetName = sourcePinState?.netName;

        const targetPinState = draft.connectors.find(c => c.id === newMapping.target.connectorId)?.pins.find(p => p.pos === newMapping.target.pinPos);
        const targetColor = targetPinState?.config?.color;
        const targetNetName = targetPinState?.netName;

        // Get all existing colors from mappings/connections
        // Filter out undefined values and only keep valid color strings
        const existingColors = draft.mappings
          .map(m => m.color)
          .filter((color): color is string => color !== undefined);
        
        // Generate a visually distinct color using our improved algorithm
        // This ensures maximum color distance from existing connections
        const newColor = getRandomHexColor(existingColors);
        
        // Use source's values if they exist, otherwise target's, otherwise use the new distinct color
        const authoritativeColor = sourceColor ?? targetColor ?? newColor;
        const authoritativeNetName = sourceNetName !== undefined ? sourceNetName : targetNetName; // Can be undefined
        console.log(`[addMapping] Determined authoritative Color: ${authoritativeColor}, NetName: ${authoritativeNetName}`);

        // 3. Create the new mapping and wire
        const newWireId = nanoid(); // Unique ID for this connection
        console.log(`[addMapping] Generated new Wire ID: ${newWireId}`);

        // Find involved pins AGAIN - their state might have changed if _disconnectPin was called
        const sourceConnector = draft.connectors.find((c: Connector) => c.id === newMapping.source.connectorId);
        const targetConnector = draft.connectors.find((c: Connector) => c.id === newMapping.target.connectorId);
        const sourcePin = sourceConnector?.pins.find((p: Pin) => p.pos === newMapping.source.pinPos);
        const targetPin = targetConnector?.pins.find((p: Pin) => p.pos === newMapping.target.pinPos);

        if (!sourcePin || !targetPin) {
          console.error("Couldn't find pins for mapping:", newMapping);
          return; // Don't add mapping if pins aren't found
        }

        // Create the final mapping object with all details
        const finalMapping: Mapping = {
          id: newWireId,
          wireId: newWireId,
          source: newMapping.source,
          target: newMapping.target,
          color: authoritativeColor,
          netName: authoritativeNetName,
        };

        draft.mappings.push(finalMapping);

        // Set connectedWireId on pins *after* creating mapping (needed by _createWire)
        console.log(`[addMapping] Adding wireId ${newWireId} to connectedWireIds for Source Pin ${sourcePin.pos} and Target Pin ${targetPin.pos}`);
        // Ensure the arrays exist before pushing
        if (!Array.isArray(sourcePin.connectedWireIds)) sourcePin.connectedWireIds = [];
        if (!Array.isArray(targetPin.connectedWireIds)) targetPin.connectedWireIds = [];
        // Add the new wire ID if it's not already present (shouldn't happen with nanoid, but good practice)
        if (!sourcePin.connectedWireIds.includes(newWireId)) {
          sourcePin.connectedWireIds.push(newWireId);
        }
        if (!targetPin.connectedWireIds.includes(newWireId)) {
          targetPin.connectedWireIds.push(newWireId);
        }

        // Create and add the corresponding wire
        console.log(`[addMapping] Creating wire object for mapping ${finalMapping.id}`);
        const wire = _createWireFromMapping(finalMapping, sourcePin, targetPin);
        if (wire) {
          console.log(`[addMapping] Adding wire ${wire.id} to state.`);
          draft.wires.push(wire);
        } else {
          console.warn(`[addMapping] Failed to create wire object.`);
        }

        // 4. Propagate the authoritative color and netName through the newly formed net
        // Start propagation from the source pin
        console.log(`[addMapping] Calling _propagateNetUpdates starting from source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} with Color=${authoritativeColor}, NetName=${authoritativeNetName}`);
        _propagateNetUpdates(newMapping.source, authoritativeColor, authoritativeNetName, draft);
        // --- End Net Merging/Creation Logic ---
        console.log(`[addMapping] End: Successfully added mapping ${newWireId}`);
    })),

    updateMapping: (id: string, updates: Partial<Omit<Mapping, 'id' | 'wireId'>>) => set(produce((draft: WireMapperState) => {
       const mappingIndex = draft.mappings.findIndex((m: Mapping) => m.id === id);
       if (mappingIndex === -1) return; // Mapping not found
      
       const originalMapping = draft.mappings[mappingIndex];
       const updatedMappingData = { ...originalMapping, ...updates };
      
       // Apply updates to the mapping
       draft.mappings[mappingIndex] = updatedMappingData;
      
       // If mapping details relevant to the wire changed (color, netName), update the wire
       const wire = draft.wires.find((w: Wire) => w.id === originalMapping.wireId);
       if (wire) {
         if (updates.color) wire.color = updates.color;
         // Removed updates.thickness check as Mapping doesn't have thickness
         if (updates.netName) wire.label = updates.netName; // Update wire label if netName changes
       }
      
       // Note: Updating source/target pins via this function is complex 
       // as it would require updating connectedWireId on the pins themselves.
       // It's generally safer to remove and re-add the mapping for structural changes.
     })),
  
    // Remove a mapping by its ID
    removeMapping: (mappingId: string) => set(produce((draft: WireMapperState) => {
        const mappingToRemove = draft.mappings.find(m => m.id === mappingId);
       
        if (!mappingToRemove) {
          console.warn(`Mapping with id ${mappingId} not found for removal.`);
          return;
        }

        const wireIdToRemove = mappingToRemove.wireId;
        console.log(`[removeMapping] Removing mapping ${mappingId} (Wire ID: ${wireIdToRemove})`);
        // Call the updated disconnect helper, passing the specific wire ID
        _disconnectPin(wireIdToRemove, draft);
        // _disconnectPin now handles removing the mapping and wire objects as well.
      })),
  };
}); // End of create

export default useWireMapperStore;
````

## File: src/app/tools/wiremapper/types/index.ts
````typescript
// Represents a single pin on a connector
export interface Pin {
  id: string;         // Unique identifier for the pin within the connector
  index: number;      // 0-based numerical index, primarily for calculation logic
  number?: number | string; // User-facing pin number (optional, could be 'A1', 1, etc.)
  pos: number; // The logical position (1-based) used for mapping/display
  name: string;       // User-defined name (e.g., 'VCC', 'GND', 'Data0')
  x: number;          // X coordinate relative to connector origin
  y: number;          // Y coordinate relative to connector origin
  connectedWireIds: string[]; // Array of wire IDs connected to this pin
  config: PinConfig; // Specific configuration for the pin (e.g., color, type)
  active: boolean;    // Whether the pin is currently enabled/used
  visible?: boolean;   // Optional: whether the pin should be rendered (defaults to true)
  row?: number;       // Row index (0-based) within the connector grid (optional)
  col?: number;       // Column index (0-based) within the connector grid (optional)
  netName?: string;    // Optional: Name of the electrical net this pin belongs to
  netColor?: string;   // Optional: Color associated with the net
  desc?: string;       // Optional: User-defined description for the pin
  voltage?: string | number; // Optional: Voltage level (e.g., 5, 3.3, '5V')
  signalType?: string; // Optional: Type of signal (e.g., 'Analog', 'Digital', 'PWM')
}

// Configuration for a single pin (can be expanded)
export interface PinConfig {
  color?: string;
  type?: 'power' | 'ground' | 'signal' | 'data' | 'nc'; // Example types
}

// Shape identifiers for connectors
export type ConnectorShape = 'Rectangle' | 'Circle';

// Add this export
export type ConnectorGender = 'Male' | 'Female' | 'Unknown';

// Configuration specific to a connector instance
export interface ConnectorConfig {
  [key: string]: any; // Allow arbitrary properties initially
  // Shape-specific properties are defined dynamically by the schema
  rows?: number;
  columns?: number;
  centerPinsHorizontal?: boolean;
  pinNumberingMode?: PinNumberingMode; // Use the enum/type
  numPins?: number;
  pinNumberingStart?: 'top' | 'right' | 'bottom' | 'left';
}

// Defines how pins are numbered visually and logically
export type PinNumberingMode =
  | 'sequential' // Simple 1, 2, 3...
  | 'row-col'    // Number across rows, then down columns
  | 'col-row'    // Number down columns, then across rows
  | 'top'        // Circle specific start
  | 'right'
  | 'bottom'
  | 'left';

// --- Dynamic Configuration Schema Types --- //
interface BaseConfigOption<TValue, TType extends string> {
  key: string; // Unique key matching ConnectorConfig property
  label: string;
  type: TType;
  defaultValue?: TValue;
  required?: boolean; // Optional required flag
  description?: string; // Optional description for the field
  placeholder?: string; // Optional placeholder text for input fields
  disabledCondition?: (state: Partial<ConnectorConfig>) => boolean; // Optional conditional disabling
  visibleCondition?: (state: Partial<ConnectorConfig>) => boolean; // Optional conditional visibility
}

export interface ConfigOptionNumber extends BaseConfigOption<number, 'number'> {
  min?: number;
  max?: number;
  step?: number;
}

export interface ConfigOptionBoolean extends BaseConfigOption<boolean, 'boolean'> {}

export interface ConfigOptionSelectOption<T> {
  label: string;
  value: T;
}

export interface ConfigOptionRadio<T = string | number> extends BaseConfigOption<T, 'radio'> {
  options: ConfigOptionSelectOption<T>[];
}

export interface ConfigOptionSelect<T = string | number> extends BaseConfigOption<T, 'select'> {
  options: ConfigOptionSelectOption<T>[];
}

export interface ConfigOptionText extends BaseConfigOption<string, 'text'> {
  // Future: minLength, maxLength, pattern (regex) etc.
}

// Union type for any config option
export type ConfigOption = ConfigOptionNumber | ConfigOptionBoolean | ConfigOptionRadio | ConfigOptionSelect | ConfigOptionText;

// Defines the structure for dynamic configuration UI generation
export type DynamicConfigSchema = {
  // Keys MUST match properties in ConnectorConfig for automatic state updates
  [key: string]: ConfigOption;
};

// Represents a connector component in the diagram
export interface Connector {
  id: string;
  name: string;
  type?: string; // Optional type identifier (e.g., 'DB9', 'RJ45')
  shape: ConnectorShape; // The shape used for rendering pins
  x: number; // Position on the canvas
  y: number;
  rows?: number; // Optional grid rows for layout
  cols?: number; // Optional grid columns for layout
  width: number; // Overall dimensions
  height: number;
  pins: Pin[];
  config: ConnectorConfig; // Holds dynamic configuration values
  // REMOVED pinNumberingMode - It's now fully within config
  gender?: ConnectorGender; // Use the exported type
  metadata?: Record<string, any>; // For extra info like datasheet link, part number etc.
}

// Represents the visual wire drawn on the canvas
export interface Wire {
  id: string; // Unique ID, typically same as the corresponding Mapping's wireId
  source: { connectorId: string; pinPos: number }; // Starting pin reference
  target: { connectorId: string; pinPos: number }; // Ending pin reference
  color: string;
  thickness?: number; // Optional thickness
  label?: string; // Optional text label on the wire
  // Other potential properties: style (dashed, solid), etc.
}

// Represents the entire diagram state
export interface DiagramState {
  connectors: Connector[];
  wires: Wire[];
  selectedConnectorIds: string[];
  selectedWireIds: string[];
  panOffset: { x: number; y: number };
  scale: number;
}

// For endpoint definitions (e.g., connecting wires)
export type ConnectionPoint = {
  connectorId: string;
  pinId: string; // Changed from pinPos to pinId for uniqueness
};

// Represents a connection between two pins
export interface Mapping {
  id: string; // Unique ID for the mapping itself
  wireId: string; // ID of the associated Wire object
  source: { connectorId: string; pinPos: number }; // Starting point
  target: { connectorId: string; pinPos: number }; // Ending point
  netName?: string; // Optional logical name for the connection
  color?: string; // Optional color for the wire/highlight
  // Add any other mapping-specific properties here
}

export interface WireMapperProject {
  projectName: string;
  connectors: Connector[];
  mappings: Mapping[];
}

export type ConnectorTemplate = Omit<Connector, 'id' | 'position' | 'pins'> & {
  pinCount: number;
  defaultPins?: Pin[];
};

export interface PinSelectionState {
  connectorId: string | null;
  pinPos: number | null;
}

export type AppMode = 'normal' | 'connectionMode';

export interface WireMapperSettings {
  snapToGrid: boolean;
  showGrid: boolean;
  gridSize: number;
  connectionMode: AppMode; // Renamed from 'mode' for clarity
  namePosition: 'inside' | 'above'; // Add back for compatibility
  simplifyConnections: boolean;
  darkMode: boolean;
  defaultWireColor?: string; // Added default color setting
  showWires: boolean; // Controls visibility of connection wires
}

export type PinIdentifier = {
  connectorId: string;
  pinPos: number;
};

export interface ContextMenuOption {
  label: string;
  action: () => void;
  danger?: boolean;
  disabled?: boolean; // Added for enabling/disabling options
}

export interface Net {
  id: string; // Unique identifier for the net
  // Add other net properties here
}
````

## File: src/app/tools/wiremapper/utils/generateUniqueId.ts
````typescript
/**
 * Generates a simple pseudo-random unique ID.
 * Note: For truly unique IDs in a distributed system, consider UUID libraries.
 */
export const generateUniqueId = (): string => {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
};
````

## File: src/app/tools/wiremapper/utils/printUtils.ts
````typescript
import { Connector, Mapping } from '../types';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ConnectorPreview } from '../components/ConnectorPreview';

/**
 * Opens a print-friendly view in a new window and triggers print dialog
 * @param connectors Array of connector objects
 * @param mappings Array of mapping objects
 */
/**
 * Gets a connector's name or fallback id
 */
const getConnectorName = (connector: Connector): string => {
  return connector.name || `Connector ${connector.id.substring(0, 6)}...`;
};

/**
 * Gets a pin's label with position
 */
const getPinLabel = (pin: any, pinPos: number): string => {
  if (!pin) return `Pin ${pinPos}`;
  return pin.name ? `${pin.name} (Pos: ${pinPos})` : `Pin ${pinPos}`;
};



/**
 * Creates an HTML-based print view of the wire harness
 */
export const openPrintView = (connectors: Connector[], mappings: Mapping[]) => {
  // Open a new window
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  
  if (!printWindow) {
    alert('Please allow pop-ups to use the print feature');
    return;
  }
  
  // Generate connector diagrams HTML using ConnectorPreview component
  let connectorsHTML = '';
  connectors.forEach(connector => {
    // Prepare the connector for rendering with ConnectorPreview
    // Assign pin numbers for display (pos value is used for number display)
    const sortedPins = [...connector.pins]
      .sort((a, b) => a.pos - b.pos)
      .map(pin => ({
        ...pin,
        number: pin.pos, // Ensure pin.number is set for ConnectorPreview
        x: pin.x || 0,   // Ensure x/y are set
        y: pin.y || 0
      }));
    
    // Create the preview element - scale up slightly for print
    const previewElement = React.createElement(ConnectorPreview, {
      connector: {
        ...connector,
        pins: sortedPins,
        shape: connector.shape || 'Rectangle',
        config: connector.config || {}
      },
      scale: 2.0 // Scale up for printing clarity
    });
    
    // Render the component to static HTML
    let connectorSvg = ReactDOMServer.renderToStaticMarkup(previewElement);
    
    // Extract just the SVG part (we'll handle the labels separately)
    const svgMatch = connectorSvg.match(/<svg[\s\S]*?<\/svg>/i);
    const svgContent = svgMatch ? svgMatch[0] : '';
    
    // Clean up the SVG by replacing template literals with actual values
    let processedSvg = svgContent
      .replace(/className="[^"]*"/g, '')
      .replace(/\$\{[^}]*\}/g, function(match) {
        // Replace template literals with actual colors
        if (match.includes('THEME_COLORS.accent')) return '#00ff9d';
        if (match.includes('THEME_COLORS.background')) return '#111826';
        if (match.includes('THEME_COLORS.pinFill')) return '#374151';
        if (match.includes('THEME_COLORS.textLight')) return '#E2E8F0';
        if (match.includes('THEME_COLORS.border')) return '#475569';
        return '';
      });
    
    // Direct approach: Replace the fill colors in the SVG with the actual pin colors
    // Find all circles in the SVG (these represent pins)
    const circleRegex = /<circle[^>]*?cx="(\d+)"[^>]*?cy="(\d+)"[^>]*?<\/circle>/g;
    let circles = [...processedSvg.matchAll(circleRegex)];
    
    // For each pin in the connector
    sortedPins.forEach((pin, index) => {
      if (index < circles.length) {
        // Get the pin's color from config
        const pinColor = pin.config?.color || '#374151';
        
        // Get the complete circle tag for this pin
        const circleMatch = circles[index][0];
        
        // Replace the fill color in the circle tag
        const updatedCircle = circleMatch.replace(/fill="[^"]*"/, `fill="${pinColor}"`);
        
        // Update the SVG with the modified circle tag
        processedSvg = processedSvg.replace(circleMatch, updatedCircle);
      }
    });
    
    
    // Create the connector HTML with SVG and pin legend
    connectorsHTML += `
      <div class="connector-box" style="margin: 20px; display: inline-block; vertical-align: top;">
        <div style="position: relative; border: 2px solid #00ff9d; border-radius: 8px; padding: 20px; background-color: #111826; max-width: 550px;">
          <div style="font-weight: bold; font-size: 16px; color: white; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background-color: #111826; padding: 5px 15px; border: 2px solid #00ff9d; border-radius: 15px;">
            ${connector.name || 'Unnamed Connector'}
          </div>
          <div style="color: #666; margin-bottom: 15px; text-align: center; font-size: 12px;">
            ${connector.type || `${connector.pins.length}-pin connector`}
          </div>
          
          <div style="display: flex; justify-content: center; margin-top: 10px;">
            ${processedSvg}
          </div>
        </div>
        
        <!-- Pin Legend/List -->
        <div style="margin-top: 15px; font-size: 12px; padding-left: 0;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${sortedPins.map(pin => {
            const pinColor = pin.config?.color || '#555555';
            const pinFunction = pin.netName || pin.desc || '';
            const pinName = pin.name || '';
            const displayText = [pinName, pinFunction].filter(Boolean).join(' (') + (pinFunction ? ')' : '');
            
            return `
              <div style="display: flex; align-items: center; margin-bottom: 6px; min-width: 120px; flex: 0 0 30%;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${pinColor}; margin-right: 6px; flex-shrink: 0;"></div>
                <div style="color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <strong>${pin.pos}:</strong> ${displayText || `Pin ${pin.pos}`}
                </div>
              </div>
            `;
          }).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
  // Generate connection tables HTML
  let tablesHTML = '';
  connectors.forEach(connector => {
    const relevantMappings = mappings.filter(
      m => m.source.connectorId === connector.id || m.target.connectorId === connector.id
    );
    
    if (relevantMappings.length === 0) return;
    
    tablesHTML += `
      <div style="margin-top: 30px; margin-bottom: 20px;">
        <h3 style="font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          ${getConnectorName(connector)} Connections
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Own Pin</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Connected To (Connector)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Connected To (Pin)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Net Name</th>
            </tr>
          </thead>
          <tbody>
            ${relevantMappings.map(mapping => {
              const isSourceLocal = mapping.source.connectorId === connector.id;
              const localPinPos = isSourceLocal ? mapping.source.pinPos : mapping.target.pinPos;
              const remoteConnectorId = isSourceLocal ? mapping.target.connectorId : mapping.source.connectorId;
              const remotePinPos = isSourceLocal ? mapping.target.pinPos : mapping.source.pinPos;
              
              // Get pin details
              const localPin = connector.pins.find(p => p.pos === localPinPos);
              const remoteConnector = connectors.find(c => c.id === remoteConnectorId);
              const remotePin = remoteConnector?.pins.find(p => p.pos === remotePinPos);
              
              const pinColor = localPin?.config?.color || '#888';
              
              return `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${pinColor}; margin-right: 8px;"></div>
                      <span>${getPinLabel(localPin, localPinPos)}</span>
                    </div>
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${remoteConnector ? getConnectorName(remoteConnector) : 'Unknown Connector'}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${getPinLabel(remotePin, remotePinPos)}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${mapping.netName || '--'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
  
  // Set up the complete HTML structure
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Wire Harness Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: white;
            color: black;
            padding: 20px;
            line-height: 1.5;
          }
          h1, h2, h3 {
            color: #333;
          }
          .connector-box svg {
            border: none !important;
          }
          .row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .connector-side {
            flex: 1;
            min-width: 300px;
          }
          .connection-side {
            flex: 1;
            min-width: 450px;
          }
          @media print {
            .no-print {
              display: none;
            }
            @page {
              size: landscape;
              margin: 1cm;
            }
            /* Critical: Force color printing */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Document
          </button>
        </div>
        
        <h1 style="text-align: center; margin-bottom: 30px;">Wire Harness Documentation</h1>
        
        <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Connector Diagrams</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${connectorsHTML}
        </div>
        
        <h2 style="margin-top: 40px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Connection Tables</h2>
        ${tablesHTML || '<p style="color: #666;">No connections to display.</p>'}
      </body>
    </html>
  `);

  // Add automatic print trigger after content is loaded
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    // Wait a brief moment to ensure all styles are applied
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  });
};
````

## File: src/app/tools/wiremapper/constants.ts
````typescript
// Constants for styling and layout

export const PIN_SIZE = 24; // Diameter of the pin visual
export const PIN_MARGIN = 4; // Margin around the pin visual
export const PIN_AREA_SIZE = PIN_SIZE + PIN_MARGIN * 2; // Total area including margin

export const CONNECTOR_PADDING = 15; // Internal padding of the connector node
export const CONNECTOR_BORDER_WIDTH = 2;

// Define and export default values for connector rendering
export const CONNECTOR_DEFAULTS = {
    MIN_SIZE: 20, // Minimum width/height
    width: 100, // Default width if not specified
    height: 50, // Default height if not specified
    PADDING: 10,
    PIN_SIZE: 6,
    PIN_SPACING: 4, // Spacing between pins in grid layout
    FILL_COLOR: 'rgba(50, 50, 60, 0.8)',
    BORDER_COLOR: '#60a5fa', // blue-400
    HOVER_BORDER_COLOR: '#2563eb', // blue-600 
    SELECTED_BORDER_COLOR: '#34d399', // emerald-400
    BORDER_WIDTH: 1,
    SELECTED_BORDER_WIDTH: 2,
    PIN_FILL_COLOR: '#d1d5db', // gray-300
    PIN_BORDER_COLOR: '#4b5563', // gray-600
    PIN_BORDER_WIDTH: 0.5,
    TEXT_COLOR: '#e5e7eb', // gray-200
    FONT_SIZE: 10,
    FONT_FAMILY: 'monospace',
};

export const CANVAS_DEFAULTS = {
    BACKGROUND_COLOR: '#111827', // gray-900
    GRID_COLOR: '#374151', // gray-700
    GRID_SIZE: 20,
};

export const WIRE_DEFAULTS = {
    COLOR: '#f59e0b', // amber-500
    HOVER_COLOR: '#fbbf24', // amber-400
    SELECTED_COLOR: '#ec4899', // pink-500
    WIDTH: 1.5,
    HOVER_WIDTH: 2,
    SELECTED_WIDTH: 2.5,
};
````

## File: src/app/tools/wiremapper/page.tsx
````typescript
import { generateToolSchema } from '@/lib/utils/seo';
import Script from 'next/script';
import { WireMapper } from './components/WireMapper';

// Enhanced SEO metadata
export const metadata = {
  title: 'Wire Mapper | Battle With Bytes',
  description: 'Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical connectors with an interactive tool.',
  keywords: ['wire mapper', 'pinout visualizer', 'connector mapping', 'wiring harness', 'electrical engineering', 'connector diagram', 'wiring diagram'],
  openGraph: {
    title: 'Wire Mapper | Battle With Bytes',
    description: 'Create visual pinout & wiring harness maps for electrical connectors.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/wiremapper',
    images: [
      {
        url: '/images/og/wire-mapper.png',
        width: 1200,
        height: 630,
        alt: 'Wire Mapper Tool',
      },
    ],
  },
};

export default function WireMapperPage() {
  // Tool schema for structured data
  const toolSchema = generateToolSchema(
    'Wire Mapper',
    'Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical connectors with an interactive tool.',
    '/tools/wiremapper'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      {/* Structured data for search engines */}
      <Script id="wiremapper-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Wire Mapper <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Create visual pinout & wiring harness maps for electrical connectors. 
          Define connector layouts, assign pin names, and map connections with this interactive tool.
        </p>
        
        <WireMapper />
      </div>
    </main>
  );
}
````

## File: src/app/tools/wiremapper/tsconfig.json
````json
{
  "extends": "../../../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "./*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
````

## File: src/app/tools/wiremapper/WireMapper_PRD.md
````markdown
# WireMapper – Visual Pinout & Wiring Mapper

## 1. Overview
**WireMapper** is a browser‑based engineering tool for visually defining, previewing, and mapping electrical connectors and their wiring harnesses. Users can quickly:

- Define generic or preconfigured connectors (pin count, layout, gender).  
- Place multiple connectors on a canvas and assign pin names, colors, and metadata.  
- Draw and label mappings between pins across connectors.  
- Hover or tap a pin to view its details in‑context.  
- Export/import harness definitions as JSON or persist them in local storage.

## 2. Goals & Objectives
- **Rapid harness prototyping**: Reduce time spent hand‑drawing connector pinouts.  
- **Accuracy**: Ensure every pin is correctly labeled, color‑coded, and mapped.  
- **Reusability**: Save connector definitions and wiring projects for future reuse.  
- **Shareability**: Export JSON schemas that can be version‑controlled or shared with team members.

## 3. Key Features

### 3.1 Connector Library & Definition
- **Prebuilt templates**: Common automotive and industrial connectors (e.g. TE 2×13, 08T‑JWPF, 08R‑JWPF, 06R‑JWPF).  
- **Generic connector builder**: Define any connector by:  
  - Pin count (total, rows, columns)  
  - Gender (male/female).  
  - Physical layout (grid, staggered).  
- **Pin metadata**: Assign each pin a `name`, `color`, `description`, and optional `voltage` or `signal type`.

### 3.2 Visual Pinout Canvas
- **Drag‑and‑drop connectors** onto the canvas, rotate or mirror if needed.  
- **Auto‑layout grid**: Pins rendered as interactive circles or squares with row/column coordinates.  
- **Hover tooltip**: Show pin metadata on hover.  
- **Selected‑pin panel**: Display full pin details below the canvas when clicked.

### 3.3 Wiring & Mapping
- **Connection mode**: Click a source pin, then a target pin to draw a link.  
- **Automatic color assignment**: Each mapping gets a distinct color, overrideable by user.  
- **Labelled wires**: Display net‑names on or near wiring lines.  
- **Routing hints**: Orthogonal line segments or Bézier curves for clarity.

### 3.4 Persistence & Export
- **LocalStorage**: Auto‑save current project in browser session.  
- **Download JSON**: Export complete project (connectors + mappings + metadata) as a JSON file.  
- **Import JSON**: Load previously saved harness definitions.

### 3.5 UI/UX Controls
- **Connector selection**: Dropdown or searchable list of prebuilt connectors.  
- **Add new connector**: Wizard to define generics (pin count, rows, columns, name).  
- **Pin editor side‑panel**: Update pin labels, colors, or delete pins.  
- **Mapping list**: Table view of all connections (source, target, net‑name, color).

## 4. User Stories
1. **As an engineer**, I want to load a TE 2×13 connector template so I don’t have to draw each pin manually.  
2. **As a technician**, I need to set pin 1–13 names quickly and assign net‑names so I can document wiring.  
3. **As a power‑system designer**, I want to define a custom 8‑pin connector (2 rows of 4) for a battery management interface.  
4. **As a project lead**, I need to export the harness JSON to include in our Git repo.  
5. **As a reviewer**, I want hover‑over tooltips on pins to inspect signal details without clutter.

## 5. Data Model (JSON Schema)
\`\`\`jsonc
{
  "projectName": "MyHarness",
  "connectors": [
    {
      "id": "C1",
      "type": "TE_6437287_8",
      "rows": 2,
      "cols": 13,
      "gender": "male",
      "pins": [
        { "pos": 1, "name": "PWR", "color": "#e91e63", "desc": "12V supply" },
        { "pos": 2, "name": "GND", "color": "#000000" }
        // ...
      ],
      "position": { "x": 100, "y": 80, "rotation": 0 }
    }
  ],
  "mappings": [
    {
      "from": { "conn": "C1", "pin": 1 },
      "to":   { "conn": "C2", "pin": 11 },
      "netName": "BAT+", "color": "#2196f3"
    }
  ]
}
\`\`\`

## 7. Non-functional Requirements
- **Performance**: Support up to 10 connectors and 100 mappings without lag.  
- **Responsiveness**: Desktop‑first, but must scale down to tablet widths.  
- **Accessibility**: Keyboard navigation for selecting pins and drawing wires.  
- **Extensibility**: Easy to add new connector templates via JSON definitions.


---
*Ready for review and prioritization.*
````

## File: src/app/tools/wiremapper/wiremapper-todo.md
````markdown
# Wire Mapper Tool - Development Todo

## Phase 1: Core Structure (MVP) - COMPLETED
- [x] Create project structure and files
- [x] Define TypeScript interfaces for connector and pin data models
- [x] Create basic connector component with pins
- [x] Implement canvas for placing connectors
- [x] Add connector creation wizard
- [x] Implement JSON import/export functionality
- [x] Add basic localStorage persistence

## Phase 2: Mapping UI - COMPLETED
- [x] Implement wire connection functionality
- [x] Add pin selection and highlighting
- [x] Create wire visualization with proper routing
- [x] Implement color coding for connections
- [x] Add connection list/table view

## Phase 3: Advanced Features - IN PROGRESS
- [x] Add connector right-click context menu
- [x] Implement connector editing and duplication
- [x] Add connector positioning and rotation
- [x] Implement custom pin layouts and visibility (Grid layout implemented, pins render)
- [x] Create color-based connection mode
- [x] Add simplified view for wire bundles
- [x] Enhance localStorage with settings persistence
- [x] Make canvas zoomable and pan-able
- [x] Add row-based pin configuration with centering options
- [x] Fix pin numbering with removable pins
- [x] Improve right-click functionality on connectors
- [x] Center pins in connector boxes
- [x] Make connector selection show details in the detail pane
- [x] Differentiate Male/Female pin rendering (Initial styling applied)
- [x] Connector styling to match site theme (Initial styling applied)
- [ ] **Fix connection drawing/creation logic** (High Priority)
  - [ ] Verify `Handle` types and `onConnect` in `ConnectorCanvas.tsx`
  - [ ] Ensure `addMapping` store action is correctly called and updates state
  - [ ] Visual feedback for starting pin and during connection drag
- [ ] Implement connection rendering (wires on canvas after connection is made)
- [ ] Implement dynamic configuration and interactive pin preview in `ConnectorBuilder`
  - [x] Refactor builder UI for dynamic options based on renderer schema (`DynamicConfigInput`).
  - [x] Add pin `active` state and toggle handler (`handlePinToggle` in `ConnectorBuilder`).
  - [x] Add click handler and visual feedback to pins in `ConnectorPreview`.
  - [ ] **Debug: Pins not rendering in `ConnectorPreview`**
    - [ ] Verify pin data is passed correctly from `ConnectorBuilder` (Check console logs).
    - [ ] Verify `renderer.getPinPosition()` returns valid coordinates.
    - [ ] Verify SVG rendering logic in `ConnectorPreview`.

## Phase 4: Additional Features - PLANNED
- [ ] Dynamic pin color on connection (If pin has no color, connected pins share a new, mutual color)
- [ ] Create library of pre-defined connector templates
- [ ] Implement connector template selection UI
- [ ] Enhance localStorage with versioning and multiple projects
- [ ] Support for multi-selection of pins
- [ ] Custom naming convention for pins
- [ ] Row-based pin configuration with dynamic sizing

## Phase 5: Polish & Documentation
- [ ] Implement keyboard shortcuts for accessibility
- [ ] Add tooltips and help text
- [ ] Create user documentation
- [ ] Add undo/redo functionality
- [ ] Implement responsive design for tablet view
- [ ] Performance optimization for large connector sets
````

## File: src/app/tools/wiremapper/wiremapper.css
````css
/* === Wiremapper Specific Styles === */

/* --- Connector Node --- */
.connector-node {
  border: 2px solid #d1d5db; /* Default light border */
  border-radius: 12px;
  background: #f8fafc; /* Default light background */
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
  position: relative;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

/* Direct dark theme application using our class-based approach */
.connector-node.dark-theme {
  background: #111827; /* Darker blue-gray for connectors */
  border-color: rgba(0, 255, 157, 0.25);
  border-radius: 12px;
  box-shadow: 0 0 5px rgba(0, 255, 157, 0.1);
  color: var(--foreground);
}

/* Dark mode styling for react flow nodes */
html.dark .react-flow__node {
  background: #101520; /* Slightly darker blue for the node container */
  border-color: rgba(0, 255, 157, 0.25);
  box-shadow: 0 0 5px rgba(0, 255, 157, 0.1);
  color: var(--foreground);
}

/* Selected state for connector nodes in dark mode */
.connector-node.dark-theme.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}

/* Selected state for React Flow nodes in dark mode */
html.dark .react-flow__node.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}

/* Prevent double borders with transparent inner node when inside ReactFlow */
html.dark .react-flow__node .connector-node.dark-theme {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.connector-node.selected {
  border-color: var(--accent-primary); /* Use !important to override base */
  box-shadow: 0 0 10px var(--accent-primary);
}

/* Connector Name/Drag Handle */
.connector-drag-handle {
  font-size: 12px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
  color: var(--muted-foreground);
  cursor: grab;
}

/* Dark mode styles for Drag Handle */
html.dark .react-flow .connector-drag-handle {
  color: var(--accent-foreground); /* Brighter text for dark mode */
}

/* Pin Grid Container inside Connector Node */
.connector-pin-grid {
  align-content: center; /* Center grid vertically if space allows */
  justify-content: center; /* Center grid horizontally if space allows */
  flex-grow: 1;
  box-sizing: border-box;
}

/* --- Pin Display --- */
.connector-pin-display {
  border: 2px solid #9ca3af; /* Default light border */
  border-radius: 50%;
  background-color: #e5e7eb; /* Default light background */
  color: #1f2937; /* Default light text */
  box-shadow: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: crosshair;
  box-sizing: border-box;
  position: relative;
}

/* Dark theme for pins using our class-based approach */
.connector-pin-display.dark-theme {
  border-color: rgba(0, 255, 157, 0.25); /* Subtle accent border */
  background-color: #1a1a1a; /* Dark background */
  color: var(--foreground); /* Dark theme text */
}

/* Pin Gender */
.connector-pin-display.female {
  /* Light mode female - keep as is or adjust if needed */
  background-color: #f0f0f0;
  border-color: #059669;
}

/* Dark theme for female pins */
.connector-pin-display.dark-theme.female {
  background-color: #222; /* Slightly lighter dark background for female pins */
  border-color: var(--accent-primary);
}

/* For backward compatibility with existing html.dark approach */
html.dark .react-flow .connector-pin-display {
  border-color: rgba(0, 255, 157, 0.25);
  background-color: #1a1a1a;
  color: var(--foreground);
}

html.dark .react-flow .connector-pin-display.female {
  background-color: #222;
  border-color: var(--accent-primary);
}

/* Pin States (Hover, Selected, Connected) */
.connector-pin-display:hover /* Added generic hover for light mode */
{
  border-color: var(--accent-secondary);
  box-shadow: 0 0 4px var(--accent-secondary);
}

/* Dark theme hover state using class-based approach */
.connector-pin-display.dark-theme:hover,
.connector-pin-display.dark-theme.hovered
{
  border-color: var(--accent-secondary);
  box-shadow: 0 0 4px var(--accent-secondary);
}

/* Selected and connected states for light mode */
.connector-pin-display.selected {
  border-color: #059669;
  box-shadow: 0 0 8px #059669;
}

.connector-pin-display.connected {
 border-color: #10b981;
 box-shadow: 0 0 5px #10b981;
}

/* Dark theme for selected and connected states */
.connector-pin-display.dark-theme.selected,
.connector-pin-display.dark-theme.connected
{
  border-color: var(--accent-primary);
  box-shadow: 0 0 5px var(--accent-primary);
}

/* For backward compatibility with existing html.dark approach */
html.dark .react-flow .connector-pin-display:hover,
html.dark .react-flow .connector-pin-display.hovered
{
  border-color: var(--accent-secondary);
  box-shadow: 0 0 4px var(--accent-secondary);
}

html.dark .react-flow .connector-pin-display.selected,
html.dark .react-flow .connector-pin-display.connected
{
  border-color: var(--accent-primary);
  box-shadow: 0 0 5px var(--accent-primary);
}

/* Pin Color Override (Applied via inline style still) */
/* This allows pin.config.color to override the background */

/* --- Edge/Connection Styling --- */

/* Default edge styles in light mode */
.react-flow__edge {
  z-index: 10;
}

.react-flow__edge-path {
  stroke: #9ca3af;
  stroke-width: 2;
}

/* Dark mode edge styling */
html.dark .react-flow__edge-path {
  stroke: var(--accent-primary);
  opacity: 0.6;
  stroke-width: 2;
}

/* Animated edges */
.react-flow__edge.animated .react-flow__edge-path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

/* Handle container styling for better context menu interaction */
.react-flow__handle {
  /* Don't prevent propagation of events to parent elements */
  pointer-events: all !important;
  z-index: 30;
}

/* Keep edges as non-interactive */
.react-flow__edge {
  pointer-events: none !important;
}

.react-flow__edge-path {
  pointer-events: none !important;
}

.react-flow__connection-path {
  pointer-events: none !important;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* Selected edges in dark mode */
html.dark .react-flow__edge.selected .react-flow__edge-path {
  stroke: var(--accent-secondary);
  opacity: 1;
  stroke-width: 3;
}

/* Animated connections */
.wire-mapper-flow .react-flow__edge.animated .react-flow__edge-path {
  stroke-dasharray: 5;
  animation: flowAnimation 2s linear infinite;
}

@keyframes flowAnimation {
  from {
    stroke-dashoffset: 20;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Ultra-minimal zoom controls */
.wire-mapper-flow .react-flow__controls {
  left: 5px !important;
  bottom: 5px !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.wire-mapper-flow .react-flow__controls button {
  width: 14px !important;
  height: 14px !important;
  min-width: 14px !important;
  min-height: 14px !important;
  border-radius: 2px !important;
  background: rgba(20, 20, 25, 0.65) !important;
  border: none !important;
  color: #aaa !important;
  font-size: 8px !important;
  line-height: 1 !important;
  margin: 0 !important;
  margin-bottom: 1px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.wire-mapper-flow .react-flow__controls button:hover {
  background: rgba(40, 40, 50, 0.9) !important;
  color: white !important;
}

/* --- Connection Handle Improvements --- */
/* Make handles easier to interact with */
.react-flow__handle {
  width: 16px !important;
  height: 16px !important;
  background: transparent;
  border: none;
  cursor: crosshair;
  opacity: 0.7;
  transition: opacity 0.2s;
  transform: translate(-50%, -50%);
}

/* Hover effect for better visibility */
.react-flow__handle:hover {
  opacity: 1;
}

/* Visual indicator when hovering on pins to show they can be connected */
.connector-pin-display:hover::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 21;
  pointer-events: none;
}
````

## File: src/app/tools/page.tsx
````typescript
import Link from 'next/link';

export default function ToolsPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Interactive Tools <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Explore a collection of interactive engineering tools designed to simplify calculations 
          and provide insights for hardware and software projects.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* MOSFET Calculator Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">01 // ELECTRONICS</div>
              <h3 className="text-xl font-bold mb-3">MOSFET Calculator</h3>
              <p className="text-gray-400 mb-4">
                Interactive tool for calculating MOSFET parameters, visualizing configurations, and determining conduction states.
              </p>
              <Link href="/tools/mosfet-calculator" className="text-green-400 font-mono text-sm hover:underline">
                Open tool →
              </Link>
            </div>
          </div>
          
          {/* Ohm's Law Calculator Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">02 // ELECTRONICS</div>
              <h3 className="text-xl font-bold mb-3">Ohm&apos;s Law Calculator</h3>
              <p className="text-gray-400 mb-4">
                Calculate voltage, current, resistance, and power using Ohm&apos;s Law with an interactive visualization and detailed explanations.
              </p>
              <Link href="/tools/ohms-law-calculator" className="text-green-400 font-mono text-sm hover:underline">
                Open tool →
              </Link>
            </div>
          </div>
          
          {/* Wire Mapper Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">03 // ENGINEERING</div>
              <h3 className="text-xl font-bold mb-3">Wire Mapper</h3>
              <p className="text-gray-400 mb-4">
                Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical components.
              </p>
              <Link href="/tools/wiremapper" className="text-green-400 font-mono text-sm hover:underline">
                Open tool →
              </Link>
            </div>
          </div>

          {/* Placeholder for future tools */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden opacity-50">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">COMING SOON</div>
              <h3 className="text-xl font-bold mb-3">More Tools</h3>
              <p className="text-gray-400 mb-4">
                Additional engineering and cybersecurity tools are in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
````

## File: src/app/globals.css
````css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --accent-primary: #00ff9d;
  --accent-secondary: #0088ff;
  --accent-purple: #c084fc;
  --grid-color: rgba(0, 255, 157, 0.05);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  background-image: 
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: 0 0;
  overflow-x: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #111111;
}

::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

/* Selection styling */
::selection {
  background: var(--accent-primary);
  color: #000000;
}

/* Terminal styling overrides */
.react-console-emulator {
  font-family: var(--font-mono) !important;
  background: rgba(10, 10, 10, 0.95) !important;
}

.react-console-emulator__content {
  padding: 1rem !important;
}

.react-console-emulator__input {
  caret-color: var(--accent-primary) !important;
}

/* Glowing text effect for headings */
.glow-text {
  text-shadow: 0 0 5px rgba(0, 255, 157, 0.5);
}

/* Code block styling */
code {
  font-family: var(--font-mono);
  background: #1a1a1a;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

pre {
  background: #1a1a1a;
  border-radius: 4px;
  padding: 1em;
  overflow-x: auto;
}

pre code {
  background: transparent;
  padding: 0;
}

/* Link styling */
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: all 0.2s ease;
}

a:hover, a:focus {
  color: var(--accent-purple);
  text-decoration-color: var(--accent-purple);
}

a:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px rgba(0, 255, 157, 0.7);
}

/* Button styling */
button, .button {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  transition: all 0.2s ease;
}

.button {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  font-family: var(--font-mono);
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 0 0 var(--accent-purple);
}

button:hover, .button:hover, button:focus, .button:focus {
  background: var(--accent-primary);
  color: #000000;
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
}

.button:hover, .button:focus {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
  box-shadow: 0 0 0 2px var(--accent-purple), 0 2px 8px 0 var(--accent-purple);
  outline: none;
}

/* Tabs Component Styling */
.tabs-container {
  margin: 2em 0;
  background: #181b1f;
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 255, 157, 0.15);
  padding: 2em 1.5em;
  overflow-x: auto;
}

.tabs-header {
  display: flex;
  margin-bottom: 1em;
  flex-wrap: nowrap;
  border-bottom: 1px solid rgba(0, 255, 157, 0.2);
  padding-bottom: 0.5em;
}

.tab-button {
  padding: 0.75em 1.5em;
  margin-right: 0.5em;
  border: none;
  border-radius: 8px 8px 0 0;
  background: #111;
  color: var(--accent-primary);
  font-weight: bold;
  font-family: var(--font-mono);
  font-size: 1.1em;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: #222;
  box-shadow: 0 0 8px rgba(0, 255, 157, 0.4);
}

.tab-button.active {
  background: linear-gradient(90deg, var(--accent-primary) 60%, var(--accent-secondary) 100%);
  color: #111;
  box-shadow: 0 0 12px rgba(0, 255, 157, 0.5);
}

.tab-content {
  padding: 1em 0.5em;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Packet Diagram Styling */
.packet-diagram {
  display: flex;
  align-items: stretch;
  margin: 1.5rem 0;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  overflow-x: auto;
  font-weight: bold;
  height: 140px;
}

.packet-segment {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5em;
  text-align: center;
  height: 100%;
}

.packet-value {
  font-size: 1.2em;
}

.packet-label {
  font-size: 1rem;
  font-weight: normal;
  margin-top: 0.6em;
}

.packet-segment.preamble {
  background: var(--accent-primary);
  color: #111;
  border-radius: 12px 0 0 12px;
  border: 2px solid var(--accent-primary);
  border-right: none;
  box-shadow: 0 0 16px rgba(0, 255, 157, 0.5);
  min-width: 240px;
  text-shadow: 0 2px 8px #000, 0 0 2px var(--accent-primary);
}

.packet-segment.preamble .packet-label {
  color: #00331a;
}

.packet-segment.sync-word {
  background: var(--accent-secondary);
  color: #111;
  border-radius: 0;
  border-top: 2px solid var(--accent-secondary);
  border-bottom: 2px solid var(--accent-secondary);
  border-right: none;
  margin-left: -3px;
  box-shadow: 0 0 16px rgba(0, 136, 255, 0.5);
  min-width: 120px;
  text-shadow: 0 2px 8px #000, 0 0 2px var(--accent-secondary);
}

.packet-segment.sync-word .packet-label {
  color: #003344;
}

.packet-segment.payload {
  background: #222;
  color: var(--accent-primary);
  border-radius: 0 12px 12px 0;
  border: 2px solid var(--accent-primary);
  border-left: none;
  margin-left: -3px;
  min-width: 140px;
  text-shadow: 0 2px 8px #000, 0 0 2px var(--accent-primary);
}

.packet-segment.payload .packet-label {
  color: #c7ffe6;
}

.packet-note {
  font-size: 1rem;
  color: #b3e6ff;
  margin-top: 0.5em;
}

/* Section heading accent */
.section-heading-purple {
  border-bottom: 2px solid var(--accent-purple);
  display: inline-block;
  padding-bottom: 0.2em;
  margin-bottom: 0.7em;
}
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../styles/dropcap.css';
import "../styles/prism-theme.css"; 
import ClientQuakeTerminalWrapper from '@/components/ClientQuakeTerminalWrapper';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Battle With Bytes | Cybersecurity, Embedded Hardware & Software Engineering",
  description: "A personal hub for sharing insights on cybersecurity, embedded hardware, and software engineering. Ask me about little data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" type="image/x-icon" href="/images/favicon.ico" sizes="180x180" />
        <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <div className="pt-16 flex-grow">
          {children}
        </div>
        <Footer />
        <ClientQuakeTerminalWrapper />
      </body>
    </html>
  );
}
````

## File: src/app/page.tsx
````typescript
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          {/* Updated grid pattern to match global style */}
          <div className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,_transparent_1px),_linear-gradient(90deg,_var(--grid-color)_1px,_transparent_1px)] bg-[length:30px_30px] bg-[0_0]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between py-8 gap-8 md:gap-16">
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
              <Image
                src="/images/site_logo.png"
                alt="Battle With Bytes Logo"
                width={700}
                height={380}
                className="drop-shadow-2xl rounded-2xl border border-[3px] border-[var(--accent-purple)] bg-black"
                style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 0 32px 0 var(--accent-purple), 0 0 0 8px #18102b' }}
                priority
              />
            </div>
            <div className="flex-1 text-center md:text-left max-w-xl">
              <div className="h-16 md:h-24" aria-hidden="true"></div>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 font-mono">
                <span className="text-[var(--accent-purple)] drop-shadow-[0_0_8px_var(--accent-purple)]">$</span> Ask me about little data.
              </p>
              <p className="text-md md:text-lg text-gray-400 mb-8 font-mono">
                A personal hub for sharing insights on cybersecurity, embedded hardware,<br />
                and software engineering through a diverse mix of content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/blog" className="button">
                  Read the Blog
                </Link>
                <Link href="/tools" className="button">
                  Explore Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-mono font-bold mb-12 text-center section-heading-purple">
            <span className="text-green-400">&lt;</span> Featured Content <span className="text-green-400">/&gt;</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Blog */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">01 // BLOG</div>
                <h3 className="text-xl font-bold mb-3">Cybersecurity Insights</h3>
                <p className="text-gray-400 mb-4">
                  Deep dives into security topics, vulnerability research, and practical defense strategies.
                </p>
                <Link href="/blog" className="text-green-400 font-mono text-sm hover:underline">
                  Read more →
                </Link>
              </div>
            </div>
            
            {/* Featured Tools */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">02 // TOOLS</div>
                <h3 className="text-xl font-bold mb-3">Engineering Calculators</h3>
                <p className="text-gray-400 mb-4">
                  Interactive tools for hardware engineers, including MOSFET power calculators and more.
                </p>
                <Link href="/tools" className="text-green-400 font-mono text-sm hover:underline">
                  Explore tools →
                </Link>
              </div>
            </div>
            
            {/* Featured Projects */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">03 // PROJECTS</div>
                <h3 className="text-xl font-bold mb-3">Open Source Work</h3>
                <p className="text-gray-400 mb-4">
                  Highlights of personal and collaborative projects in embedded systems and software development.
                </p>
                <Link href="/projects" className="text-green-400 font-mono text-sm hover:underline">
                  View projects →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Terminal Tip Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-black/70 border border-gray-800 rounded-lg p-6 font-mono">
            <p className="text-gray-400 mb-2">Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">~</kbd> to access the terminal</p>
            <p className="text-green-400">Try commands like <code>help</code>, <code>about</code>, or <code>blog</code></p>
          </div>
        </div>
      </section>
    </main>
  );
}
````

## File: src/app/sitemap.ts
````typescript
import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

// Configure for static export
export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ril3y.github.io/battlewithbytes.io'
    : 'https://battlewithbytes.io';
  
  // Core pages
  const routes = [
    '',
    '/tools',
    '/tools/mosfet-calculator',
    '/tools/ohms-law-calculator',
    '/blog',
    '/projects',
    '/about',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Get blog posts for dynamic routes
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const blogPosts = fs.existsSync(blogDir) 
      ? fs.readdirSync(blogDir)
        .filter(file => fs.statSync(path.join(blogDir, file)).isDirectory())
        .map(slug => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      : [];

    return [...routes, ...blogPosts];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
````

## File: src/components/HDMIPinout/HDMIPinout.jsx
````javascript
// src/components/HDMIPinout.jsx

import React, { useState } from 'react';
import styles from './HDMIPinout.module.css';

const pinData = {
  1: { name: 'TMDS Data2+', description: 'Transition Minimized Differential Signaling for video data', category: 'video' },
  2: { name: 'TMDS Data2 Shield', description: 'Ground shield for Data2', category: 'ground' },
  3: { name: 'TMDS Data2−', description: 'Negative TMDS Data2', category: 'video' },
  4: { name: 'TMDS Data1+', description: 'Positive TMDS Data1', category: 'video' },
  5: { name: 'TMDS Data1 Shield', description: 'Ground shield for Data1', category: 'ground' },
  6: { name: 'TMDS Data1−', description: 'Negative TMDS Data1', category: 'video' },
  7: { name: 'TMDS Data0+', description: 'Positive TMDS Data0', category: 'video' },
  8: { name: 'TMDS Data0 Shield', description: 'Ground shield for Data0', category: 'ground' },
  9: { name: 'TMDS Data0−', description: 'Negative TMDS Data0', category: 'video' },
  10: { name: 'TMDS Clock+', description: 'Positive TMDS Clock', category: 'clock' },
  11: { name: 'TMDS Clock Shield', description: 'Ground shield for Clock', category: 'ground' },
  12: { name: 'TMDS Clock−', description: 'Negative TMDS Clock', category: 'clock' },
  13: { name: 'CEC', description: 'Consumer Electronics Control - allows devices to control each other', category: 'control' },
  14: { name: 'Reserved', description: 'Not connected, reserved for future use', category: 'reserved' },
  15: { name: 'SCL (DDC)', description: 'I2C Clock line for DDC - what we use for hacking', category: 'i2c', highlight: true },
  16: { name: 'SDA (DDC)', description: 'I2C Data line for DDC - what we use for hacking', category: 'i2c', highlight: true },
  17: { name: 'DDC/CEC Ground', description: 'Ground reference for DDC and CEC', category: 'ground' },
  18: { name: '+5V Power', description: '5 volt power (50mA max)', category: 'power' },
  19: { name: 'Hot Plug Detect', description: 'Indicates when a display is connected', category: 'control' }
};

const categoryColors = {
  video: '#0088ff',
  ground: '#666666',
  clock: '#ffa500',
  control: '#c084fc',
  reserved: '#444444',
  i2c: '#00ff9d',
  power: '#ff3333'
};

const HDMIPinout = () => {
  const [activePin, setActivePin] = useState(15); // Default to SCL pin
  const [viewMode, setViewMode] = useState('pinout'); // 'pinout' or 'table'
  
  return (
    <div className={styles.hdmiContainer}>
      <div className={styles.viewToggle}>
        <button 
          className={viewMode === 'pinout' ? styles.activeView : ''} 
          onClick={() => setViewMode('pinout')}
        >
          Connector View
        </button>
        <button 
          className={viewMode === 'table' ? styles.activeView : ''} 
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
      </div>
      
      {viewMode === 'pinout' ? (
        <div className={styles.pinoutView}>
          <div className={styles.connectorShape}>
            {/* Connector graphical representation */}
            <div className={styles.pinContainer}>
              {Object.entries(pinData).map(([pinNumber, data]) => (
                <div 
                  key={pinNumber}
                  className={`${styles.pin} ${activePin === parseInt(pinNumber) ? styles.activePin : ''} ${data.highlight ? styles.highlightPin : ''}`}
                  style={{ 
                    backgroundColor: data.highlight ? categoryColors[data.category] : undefined,
                    borderColor: categoryColors[data.category]
                  }}
                  onMouseEnter={() => setActivePin(parseInt(pinNumber))}
                  onFocus={() => setActivePin(parseInt(pinNumber))}
                  onClick={() => setActivePin(parseInt(pinNumber))}
                  tabIndex={0}
                  data-pin={pinNumber}
                ></div>
              ))}
            </div>
          </div>
          
          <div className={styles.pinDetails}>
            <h3>
              Pin {activePin}: <span style={{ color: categoryColors[pinData[activePin].category] }}>{pinData[activePin].name}</span>
            </h3>
            <p>{pinData[activePin].description}</p>
            {pinData[activePin].highlight && (
              <div className={styles.hackingNote}>
                <h4>Hacking Potential</h4>
                <p>This I2C pin can be accessed to interact with the display's EDID and control functions, allowing us to programmatically control HDMI devices.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableView}>
          <table>
            <thead>
              <tr>
                <th>Pin</th>
                <th>Name</th>
                <th>Function</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(pinData).map(([pinNumber, data]) => (
                <tr 
                  key={pinNumber} 
                  className={data.highlight ? styles.highlightRow : ''}
                  onClick={() => setActivePin(parseInt(pinNumber))}
                >
                  <td>{pinNumber}</td>
                  <td style={{ color: categoryColors[data.category] }}>{data.name}</td>
                  <td>{data.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.legend}>
        <h4>Pin Categories</h4>
        <ul>
          {Object.entries(categoryColors).map(([category, color]) => (
            <li key={category}>
              <span className={styles.colorBox} style={{ backgroundColor: color }}></span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HDMIPinout;
````

## File: src/components/HDMIPinout/HDMIPinout.module.css
````css
/* src/components/HDMIPinout.module.css */

.hdmiContainer {
    font-family: 'JetBrains Mono', monospace;
    background-color: #0a0d11;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 2rem 0;
    color: #ffffff;
  }
  
  .viewToggle {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .viewToggle button {
    background-color: transparent;
    border: 1px solid #444;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .viewToggle button.activeView {
    background-color: rgba(0, 255, 157, 0.2);
    border-color: #00ff9d;
    color: #00ff9d;
  }
  
  .pinoutView {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .connectorShape {
    position: relative;
    height: 180px;
    background-color: #222;
    border-radius: 6px;
    border: 2px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pinContainer {
    display: grid;
    grid-template-columns: repeat(19, 1fr);
    grid-gap: 5px;
    justify-content: center;
    padding: 1rem;
    width: auto;
  }
  
  .pin {
    height: 30px;
    width: 12px;
    background-color: #333;
    border: 1px solid #666;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  
  .pin:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  }
  
  .pin::after {
    content: attr(data-pin);
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    color: #999;
  }
  
  .activePin {
    transform: translateY(-10px);
    box-shadow: 0 0 15px currentColor;
  }
  
  .highlightPin {
    animation: pulse 2s infinite;
  }
  
  .pinDetails {
    padding: 1rem;
    border: 1px solid #333;
    border-radius: 6px;
    background-color: rgba(10, 13, 17, 0.8);
  }
  
  .pinDetails h3 {
    margin-top: 0;
  }
  
  .hackingNote {
    margin-top: 1rem;
    padding: 1rem;
    border-left: 3px solid #00ff9d;
    background-color: rgba(0, 255, 157, 0.1);
  }
  
  .tableView table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .tableView th, .tableView td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #333;
  }
  
  .tableView th {
    background-color: #111;
    color: #00ff9d;
  }
  
  .highlightRow {
    background-color: rgba(0, 255, 157, 0.1);
    cursor: pointer;
  }
  
  .highlightRow:hover {
    background-color: rgba(0, 255, 157, 0.2);
  }
  
  .legend {
    margin-top: 2rem;
  }
  
  .legend ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    list-style: none;
    padding: 0;
  }
  
  .legend li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .colorBox {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 255, 157, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 255, 157, 0);
    }
  }
  
  @media (min-width: 768px) {
    .pinoutView {
      flex-direction: row;
    }
    
    .pinDetails {
      width: 50%;
    }
    
    .connectorShape {
      width: 50%;
    }
  }
````

## File: src/components/I2CDetectOutput/I2CDetectOutput.module.css
````css
.container {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  margin: 1.5rem 0;
  background-color: #0a0d11;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 1rem;
}

.output {
  display: block;
  margin: 0;
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 0.9rem;
  white-space: pre;
  overflow-x: auto;
}

.command {
  display: block;
  color: #ff851b;
  margin-bottom: 0.5rem;
}

.header {
  display: block;
  color: #7fdbff;
  margin-bottom: 0.25rem;
}

.row {
  display: block;
  color: #ff851b;
}

.highlight {
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.highlight:hover {
  text-shadow: 0 0 8px currentColor;
}

.tooltip {
  position: absolute;
  background-color: #111;
  color: #fff;
  border: 1px solid #00ff9d;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  max-width: 280px;
  box-shadow: 0 2px 10px rgba(0, 255, 157, 0.3);
  z-index: 10;
  transform: translateX(-50%);
  white-space: normal;
  text-align: center;
  pointer-events: none;
}

.tooltipArrow {
  position: absolute;
  bottom: -9px;
  left: 50%;
  margin-left: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #00ff9d;
}
````

## File: src/components/I2CDetectOutput/I2CDetectOutput.tsx
````typescript
"use client";

import React, { useState } from 'react';
import styles from './I2CDetectOutput.module.css';

interface TooltipData {
  address: string;
  color: string;
  content: string;
}

interface I2CDetectOutputProps {
  highlights?: TooltipData[];
}

// This component is specifically designed to render i2cdetect output
// with proper formatting and tooltips for specific addresses
const I2CDetectOutput: React.FC<I2CDetectOutputProps> = ({ 
  highlights = []
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    const address = target.getAttribute('data-address');
    const highlight = highlights.find(h => h.address === address);
    
    if (highlight) {
      const rect = target.getBoundingClientRect();
      const containerRect = document.getElementById('i2c-output-container')?.getBoundingClientRect();
      
      if (containerRect) {
        // Move tooltip higher so it's one line above the number
        // Using a larger value (100px) to ensure it's moved up by roughly one line
        setTooltipPosition({
          top: rect.top - containerRect.top - 100,
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        
        setActiveTooltip(highlight.content);
      }
    }
  };
  
  // Helper to render a highlighted address
  const renderAddress = (address: string) => {
    const highlight = highlights.find(h => h.address === address);
    
    if (highlight) {
      return (
        <span 
          className={styles.highlight}
          style={{ color: highlight.color }}
          data-address={address}
          onMouseEnter={handleMouseOver}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {address}
        </span>
      );
    }
    
    return address;
  };

  return (
    <div id="i2c-output-container" className={styles.container}>
      <pre className={styles.output}>
<span className={styles.command}>$ sudo i2cdetect -y 2</span>
<span className={styles.header}>     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f</span>
<span className={styles.row}>00:                         -- -- -- -- -- -- -- --</span>
<span className={styles.row}>10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>30: -- -- -- -- -- -- -- {renderAddress("37")} -- -- 3a -- -- -- -- --</span>
<span className={styles.row}>40: -- -- -- -- -- -- -- -- -- -- 4a 4b -- -- -- --</span>
<span className={styles.row}>50: {renderAddress("50")} -- -- -- 54 -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>70: -- -- -- -- -- -- -- --</span>
      </pre>
      
      {activeTooltip && (
        <div 
          className={styles.tooltip}
          style={{ 
            top: `${tooltipPosition.top}px`, 
            left: `${tooltipPosition.left}px` 
          }}
        >
          {activeTooltip}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default I2CDetectOutput;
````

## File: src/components/I2CDetectOutput/index.ts
````typescript
import I2CDetectOutput from './I2CDetectOutput';

export default I2CDetectOutput;
````

## File: src/components/InteractiveCodeBlock/index.ts
````typescript
import InteractiveCodeBlock from './InteractiveCodeBlock';

export default InteractiveCodeBlock;
````

## File: src/components/InteractiveCodeBlock/InteractiveCodeBlock.module.css
````css
.container {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  margin: 1.5rem 0;
}

.codeBlock {
  background-color: #0a0d11;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 1rem;
  color: #e0e0e0;
  overflow-x: auto;
  line-height: 1.5;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', monospace;
  tab-size: 4;
  position: relative;
}

/* Line numbers styling */
.codeBlock.line-numbers {
  padding-left: 3.8rem; /* Make room for line numbers */
  counter-reset: linenumber;
}

.codeBlock.line-numbers > code {
  position: relative;
  white-space: pre;
}

.codeBlock.line-numbers .line-numbers-rows {
  position: absolute;
  pointer-events: none;
  top: 0;
  font-size: 100%;
  left: -3.8rem;
  width: 3rem;
  /* Border separating line numbers from code */
  border-right: 1px solid #444;
  user-select: none;
}

.codeBlock.line-numbers .line-numbers-rows > span {
  display: block;
  counter-increment: linenumber;
  pointer-events: none;
}

.codeBlock.line-numbers .line-numbers-rows > span:before {
  content: counter(linenumber);
  color: #666; /* Muted color for line numbers */
  display: block;
  padding-right: 0.8rem;
  text-align: right;
}

.codeBlock code {
  font-family: 'JetBrains Mono', monospace;
  display: block;
  white-space: pre-wrap;
  word-spacing: normal;
  word-break: normal;
  letter-spacing: 0;
  counter-reset: line;
}

.lineNumber {
  display: inline-block;
  width: 2.5rem;
  color: #666;
  text-align: right;
  margin-right: 1rem;
  user-select: none;
  border-right: 1px solid #333;
  padding-right: 0.5rem;
}

.fileInfo {
  display: block;
  color: #00ff9d;
  font-style: italic;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px dashed #444;
  font-size: 0.85rem;
  opacity: 0.8;
}

.codeWrapper {
  position: relative;
}

.highlight {
  cursor: pointer;
  position: relative;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: bold;
  transition: all 0.2s;
}

.highlight:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0a0d11;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 1.5rem;
  color: #e0e0e0;
  min-height: 100px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

.loading {
  color: #00ff9d;
}

.error {
  color: #ff3333;
}

.copyButton {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid #333;
  color: #00ff9d;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}

.copyButton:hover {
  background-color: rgba(0, 0, 0, 0.8);
  border-color: #00ff9d;
}

.copySuccess {
  background-color: rgba(0, 255, 157, 0.2) !important;
}

.tooltip {
  position: absolute;
  background-color: #111;
  color: #fff;
  border: 1px solid #00ff9d;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  max-width: 280px;
  box-shadow: 0 2px 10px rgba(0, 255, 157, 0.3);
  z-index: 10;
  transform: translateX(-50%);
  white-space: normal;
  text-align: center;
  pointer-events: none;
}

.tooltipArrow {
  position: absolute;
  bottom: -9px;
  left: 50%;
  margin-left: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #00ff9d;
}
````

## File: src/components/InteractiveCodeBlock/InteractiveCodeBlock.tsx
````typescript
"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './InteractiveCodeBlock.module.css';
import Prism from 'prismjs';
// Import Prism's line numbers plugin
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
// Import line numbers styling
import './prism-line-numbers.css';
// Import Prism's themes and languages (these should already be imported in your project via CodeBlock)

export interface Highlight {
  value: string;
  color?: string;
  tooltip: string;
}

interface InteractiveCodeBlockProps {
  code?: string;         // Code can be optional if githubUrl is provided
  highlights?: Highlight[];
  language?: string;
  githubUrl?: string;    // GitHub URL to fetch code from (can be normal or raw URL)
  startLine?: number;    // Start line to display (0-indexed)
  endLine?: number;      // End line to display (0-indexed), inclusive
  showLineNumbers?: boolean; // Whether to show line numbers
}

const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({ 
  code = '', 
  highlights = [],
  language = 'bash',
  githubUrl,
  startLine,
  endLine,
  showLineNumbers = false
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [codeContent, setCodeContent] = useState<string>(code);
  const [isLoading, setIsLoading] = useState<boolean>(!!githubUrl);
  const [error, setError] = useState<string | null>(null);
  const [effectiveStartLine, setEffectiveStartLine] = useState<number | undefined>(startLine);
  const [effectiveEndLine, setEffectiveEndLine] = useState<number | undefined>(endLine);
  const [copySupported, setCopySupported] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // Check if clipboard API is supported
  useEffect(() => {
    setCopySupported(!!navigator?.clipboard);
  }, []);
  
  // Apply Prism.js highlighting once code is loaded and rendered
  useEffect(() => {
    if (codeRef.current && !isLoading && !error) {
      // Need to wait a bit for the DOM to be updated with the code content
      setTimeout(() => {
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      }, 0);
    }
  }, [codeContent, isLoading, error, language]);
  
  // Convert GitHub URL to raw URL if needed
  const getRawGitHubUrl = (url: string): string => {
    // Check if it's already a raw URL
    if (url.includes('raw.githubusercontent.com')) {
      return url;
    }
    
    // Convert regular GitHub URL to raw URL
    // Format: https://github.com/{owner}/{repo}/blob/{branch}/{path} -> https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
    try {
      const githubRegex = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.*)/;
      const match = url.match(githubRegex);
      
      if (match) {
        const [/* _ */, owner, repo, branch, path] = match;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      }
      
      return url; // Return original if we can't parse it
    } catch (e) {
      console.error('Error converting GitHub URL:', e);
      return url;
    }
  };
  
  // Extract line numbers from URL if present
  const extractLineInfo = (url: string): { url: string, extractedStartLine?: number, extractedEndLine?: number } => {
    // Handle GitHub line anchors like #L10-L20
    const lineAnchorRegex = /#L(\d+)(?:-L(\d+))?$/;
    const match = url.match(lineAnchorRegex);
    
    if (match) {
      const extractedStartLine = parseInt(match[1]) - 1; // Convert to 0-indexed
      const extractedEndLine = match[2] ? parseInt(match[2]) - 1 : extractedStartLine;
      const cleanUrl = url.replace(lineAnchorRegex, '');
      
      return { url: cleanUrl, extractedStartLine, extractedEndLine };
    }
    
    return { url };
  };

  // Fetch code from GitHub if URL is provided
  useEffect(() => {
    if (!githubUrl) return;
    
    const fetchCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Process the URL to extract line information and convert to raw if needed
        const { url: cleanUrl, extractedStartLine, extractedEndLine } = extractLineInfo(githubUrl);
        const rawUrl = getRawGitHubUrl(cleanUrl);
        
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.text();
        setCodeContent(data);
        
        // Update start and end lines if they were in the URL and not explicitly provided
        if (extractedStartLine !== undefined && startLine === undefined) {
          setEffectiveStartLine(extractedStartLine);
        }
        
        if (extractedEndLine !== undefined && endLine === undefined) {
          setEffectiveEndLine(extractedEndLine);
        }
      } catch (err) {
        console.error('Error fetching code from GitHub:', err);
        setError(`Failed to load code from ${githubUrl}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCode();
  }, [githubUrl, startLine, endLine]);
  
  // Get the filtered code content based on start/end lines
  const getFilteredContent = () => {
    // First check if we have content
    if (!codeContent.trim()) {
      return '';
    }
    
    // Split the code into lines
    const allLines = codeContent.split('\n');
    
    // Apply line range filtering if specified
    const start = effectiveStartLine !== undefined ? effectiveStartLine : 0;
    const end = effectiveEndLine !== undefined ? effectiveEndLine : allLines.length - 1;
    
    // Validate range - make sure we don't go out of bounds
    const validStart = Math.max(0, Math.min(start, allLines.length - 1));
    const validEnd = Math.max(validStart, Math.min(end, allLines.length - 1));
    
    // Get the lines we want to display
    const filteredLines = allLines.slice(validStart, validEnd + 1);

    // If line numbers are enabled, prepare for Prism.js line numbers class
    if (showLineNumbers) {
      return filteredLines.join('\n');
    } else {
      return filteredLines.join('\n');
    }
  };
  
  // Info about the line range being displayed
  const getLineRangeInfo = () => {
    if (!codeContent.trim()) return null;
    
    const allLines = codeContent.split('\n');
    const start = effectiveStartLine !== undefined ? effectiveStartLine : 0;
    const end = effectiveEndLine !== undefined ? effectiveEndLine : allLines.length - 1;
    
    // Validate range
    const validStart = Math.max(0, Math.min(start, allLines.length - 1));
    const validEnd = Math.max(validStart, Math.min(end, allLines.length - 1));
    
    // Only show info if we're displaying a subset of the file
    if (showLineNumbers && (validStart > 0 || validEnd < allLines.length - 1)) {
      return {
        start: validStart + 1, // 1-indexed for display
        end: validEnd + 1,    // 1-indexed for display
        total: allLines.length
      };
    }
    
    return null;
  };
  
  // Process highlights
  /*
  const processHighlights = (text: string) => {
    if (!highlights?.length) return text;
    
    const processedText = text;
    highlights
      .filter(h => h && h.value)
      .sort((a, b) => b.value.length - a.value.length)
      .forEach(highlight => {
        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const value = escapeRegExp(highlight.value);
        
        // Match the value with surrounding non-word characters or at line boundaries
        // const regex = new RegExp(`(^|[^\\w])(${value})([^\\w]|$)`, 'g');
        
        // This is simplified - we would need more complex logic to actually highlight in React
        // Instead, we'll rely on Prism.js for syntax highlighting and just add our own custom
        // highlighting via mouse interaction
      });
    
    return processedText;
  };
  */

  // Handle showing tooltip when a highlighted word is hovered or focused
  /*
  const handleMouseOver = (e: React.MouseEvent<HTMLPreElement>) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-highlight')) {
      const value = target.getAttribute('data-highlight');
      const highlight = highlights.find(h => h.value === value);
      
      if (highlight) {
        const rect = target.getBoundingClientRect();
        const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        // Calculate position to show tooltip much higher above the highlighted text
        // Move it up approximately 2 rows (using line-height estimate)
        // const lineHeight = 24; // Estimated line height
        setTooltipPosition({
          top: rect.top - containerRect.top - 120, // Position 2 rows higher (80 + 2*20)
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        setActiveTooltip(highlight.tooltip);
      } else {
        setActiveTooltip(null);
      }
    } else {
      // If not hovering over a highlight, check if we're hovering over the code block itself
      // and clear tooltip if needed, or keep it if it's a child of a highlight span
      let parentWithHighlight = target.closest('[data-highlight]');
      if (!parentWithHighlight) {
        setActiveTooltip(null);
      }
    }
  };
  */
  
  // Handle highlighting when hovering over specific code elements
  const handleHighlightHover = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    // Check if we're hovering over an element that matches one of our highlights
    if (highlights && highlights.length > 0) {
      // Get the text content of the element we're hovering over
      const textContent = target.textContent || '';
      
      // Find if any of our highlights match this text
      const matchingHighlight = highlights.find(h => {
        // Make sure the highlight and its value property exist
        if (!h || typeof h.value !== 'string') return false;
        
        // Now it's safe to do the includes checks
        return textContent.includes(h.value) || h.value.includes(textContent);
      });
      
      if (matchingHighlight && matchingHighlight.tooltip) {
        const rect = target.getBoundingClientRect();
        const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        setTooltipPosition({
          top: rect.top - containerRect.top - 40,
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        
        setActiveTooltip(matchingHighlight.tooltip);
      }
    }
  };
  
  // Get filtered code and line range info
  const filteredCode = !isLoading && !error ? getFilteredContent() : '';
  const lineRangeInfo = getLineRangeInfo();
  
  // Trigger syntax highlighting after render
  useEffect(() => {
    if (codeRef.current && filteredCode) {
      Prism.highlightElement(codeRef.current);
    }
  }, [filteredCode]);

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <span>Loading code...</span>
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className={styles.codeWrapper}>
          {/* Line range info banner */}
          {lineRangeInfo && (
            <div className={styles.fileInfo}>
              {/* Showing lines {lineRangeInfo.start}-{lineRangeInfo.end} of {lineRangeInfo.total} total lines */}
            </div>
          )}
          
          {/* Copy button */}
          {copySupported && (
            <button 
              className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
              onClick={() => {
                try {
                  navigator.clipboard.writeText(filteredCode)
                    .then(() => {
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    })
                    .catch(err => {
                      console.error('Failed to copy: ', err);
                      setCopySuccess(false);
                    });
                } catch (err) {
                  console.error('Clipboard error:', err);
                }
              }}
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
          )}
          
          {/* Code block with syntax highlighting */}
          <pre 
            className={`${styles.codeBlock} language-${language} prism-code bg-gray-900 p-4 rounded-md overflow-x-auto font-mono text-sm ${showLineNumbers ? 'line-numbers' : ''}`}
            onMouseOver={handleHighlightHover}
            onMouseOut={() => setActiveTooltip(null)}
            data-start={lineRangeInfo?.start || 1}
            style={{
              counterReset: `linenumber ${(lineRangeInfo?.start || 1) - 1}`
            }}
          >
            <code 
              ref={codeRef}
              className={`language-${language}`}
            >
              {filteredCode}
            </code>
          </pre>
        </div>
      )}
      
      {activeTooltip && (
        <div 
          className={styles.tooltip}
          style={{ 
            top: `${tooltipPosition.top}px`, 
            left: `${tooltipPosition.left}px` 
          }}
        >
          {activeTooltip}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodeBlock;
````

## File: src/components/InteractiveCodeBlock/prism-line-numbers.css
````css
/**
 * Line Numbers plugin for prism.js
 * Based on https://prismjs.com/plugins/line-numbers/
 */

pre.line-numbers {
	position: relative;
	padding-left: 3.8em;
	counter-reset: linenumber;
}

pre.line-numbers > code {
	position: relative;
	white-space: inherit;
}

.line-numbers .line-numbers-rows {
	position: absolute;
	pointer-events: none;
	top: 0;
	font-size: 100%;
	left: -3.8em;
	width: 3em; /* works for line-numbers below 1000 lines */
	letter-spacing: -1px;
	border-right: 1px solid #444;
	user-select: none;
}

.line-numbers-rows > span {
	display: block;
	counter-increment: linenumber;
}

.line-numbers-rows > span:before {
	content: counter(linenumber);
	color: #666;
	display: block;
	padding-right: 0.8em;
	text-align: right;
}
````

## File: src/components/projects/ProjectCard.tsx
````typescript
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { ProjectMetadata } from '@/lib/utils/projects'; 

interface ProjectCardProps {
  project: ProjectMetadata;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="bg-gray-900/90 border border-green-500/30 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-green-500/20 flex flex-col focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
      style={{ textDecoration: 'none' }}
      aria-label={`View project: ${project.title}`}
    >
      {project.coverImage && (
        <div className="relative w-full h-48 group"> 
          <Image
            src={project.coverImage}
            alt={`${project.title} cover image`}
            layout="fill"
            objectFit="cover"
            className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* Optional theme overlay - uses green color from the theme */}
          {project.useThemeOverlay !== false && (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-gray-900/60 mix-blend-multiply"
              aria-hidden="true"
            />
          )}
        </div>
      )}
      <div className="p-6 flex-grow relative"> 
        <h3 className="text-xl font-semibold text-green-400 mb-3 tracking-wide pr-8"> 
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          {project.description}
        </p>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent Link navigation when clicking icon
            aria-label={`${project.title} GitHub repository`}
            className="absolute bottom-4 right-4 z-10 p-1 bg-gray-800 bg-opacity-0 rounded-full hover:bg-opacity-25 transition-colors duration-200" 
          >
            <svg
              width="24" 
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        )}
      </div>
    </Link>
  );
};

export default ProjectCard;
````

## File: src/components/projects/ProjectContent.tsx
````typescript
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Custom components that can be used in MDX - matching your blog styling
const components = {
  // Override default elements with custom styling
  h1: (props: ComponentProps) => (
    <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 text-white glow-text" {...props} />
  ),
  h2: (props: ComponentProps) => (
    <h2 className="text-2xl md:text-3xl font-bold font-mono mt-8 mb-4 text-green-400" {...props} />
  ),
  h3: (props: ComponentProps) => (
    <h3 className="text-xl md:text-2xl font-bold font-mono mt-6 mb-3" {...props} />
  ),
  p: (props: ComponentProps) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  a: (props: ComponentProps) => (
    <a className="text-green-400 hover:text-green-300 underline" {...props} />
  ),
  ul: (props: ComponentProps) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: ComponentProps) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: ComponentProps) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props: ComponentProps) => (
    <blockquote className="border-l-4 border-green-400 pl-4 my-4 italic bg-black/30 p-3" {...props} />
  ),
  code: (props: { children?: React.ReactNode; className?: string }) => {
    const { className } = props;
    // If it's an inline code block (no language specified)
    if (!className) {
      return (
        <code className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm" {...props} />
      );
    }
    // For code blocks with language
    return (
      <code className={`${className} block overflow-x-auto`} {...props} />
    );
  },
  pre: (props: ComponentProps) => (
    <pre className="bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm" {...props} />
  ),
  table: (props: ComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full bg-black/30 border border-gray-700 rounded-md" {...props} />
    </div>
  ),
  th: (props: ComponentProps) => (
    <th className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50" {...props} />
  ),
  td: (props: ComponentProps) => (
    <td className="border border-gray-700 px-4 py-2" {...props} />
  ),
  // Custom components
  Image,
  Link,
};

interface ProjectContentProps {
  content: string;
}

// Function to manually process tables in MDX content
const preprocessMdxContent = (content: string): string => {
  // If the content doesn't contain any tables, return it as is
  if (!content.includes('|')) return content;
  
  // Replace any table content with HTML table elements
  const lines = content.split('\n');
  let inTable = false;
  let tableContent = '';
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableContent = '<table className="min-w-full bg-black/30 border border-gray-700 rounded-md">\n<tbody>\n';
      }
      
      // Process header separator line (e.g., |---|---|)
      if (line.includes('---')) {
        continue; // Skip the separator line
      }
      
      // Process table row
      const cells = line.split('|').filter(cell => cell.trim() !== '');
      const isHeader = i > 0 && lines[i-1].includes('|') && lines[i+1] && lines[i+1].includes('---');
      
      tableContent += '<tr>\n';
      cells.forEach(cell => {
        if (isHeader) {
          tableContent += `  <th className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50">${cell.trim()}</th>\n`;
        } else {
          tableContent += `  <td className="border border-gray-700 px-4 py-2">${cell.trim()}</td>\n`;
        }
      });
      tableContent += '</tr>\n';
    } else {
      if (inTable) {
        inTable = false;
        tableContent += '</tbody>\n</table>';
        processedLines.push(tableContent);
        tableContent = '';
      }
      processedLines.push(line);
    }
  }
  
  // If we ended while still in a table
  if (inTable) {
    tableContent += '</tbody>\n</table>';
    processedLines.push(tableContent);
  }
  
  return processedLines.join('\n');
};

export default function ProjectContent({ content }: ProjectContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processMdx = async () => {
      try {
        // Preprocess content to handle tables
        const processedContent = preprocessMdxContent(content);
        
        const mdxSource = await serialize(processedContent, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            development: process.env.NODE_ENV === 'development',
          },
          parseFrontmatter: false,
        });
        setMdxSource(mdxSource);
        setError(null);
      } catch (err: unknown) {
        console.error('Error processing MDX:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error processing MDX content';
        setError(errorMessage);
      }
    };
    
    processMdx();
  }, [content]);
  
  return (
    <article className="max-w-4xl mx-auto">
      {/* Cover image already handled in the parent component */}
      
      {/* Content section with MDX */}
      <div className="py-4">
        {error ? (
          <div className="text-red-500 bg-red-900/20 p-4 rounded-md border border-red-500">
            <h3 className="font-bold mb-2">Error Rendering Content</h3>
            <p>{error}</p>
          </div>
        ) : mdxSource ? (
          <div className="mdx-content">
            <MDXRemote {...mdxSource} components={components} />
          </div>
        ) : (
          <div className="flex justify-center items-center p-12">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-gray-700 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
````

## File: src/components/radarchart/HardwareScoreRadar.tsx
````typescript
// "use client";

// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// export type HardwareScore = {
//   metric: string;
//   score: number;
// };

// export default function HardwareScoreRadar({ data }: { data: HardwareScore[] }) {
//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
//         <PolarGrid />
//         <PolarAngleAxis dataKey="metric" />
//         <PolarRadiusAxis angle={30} domain={[0, 10]} />
//         <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
//       </RadarChart>
//     </ResponsiveContainer>
//   );
// }
````

## File: src/components/terminal/commands/BannerCommand.ts
````typescript
import { Command } from './Command';

export class BannerCommand extends Command {
  name = 'banner';
  description = 'Display a cyberpunk ASCII art banner';
  usage = 'banner';

  execute(): string {
    // ASCII art styled for the Battle With Bytes theme
    return [
      '',
      '\x1b[38;2;0;255;157m',
      '  ____        _   _     _      _     _ _     _     _           _       _           _         ',
      ' |  _ \\      | | | |   | |    | |   | | |   | |   | |         | |     | |         | |        ',
      ' | |_) | __ _| |_| |__ | |__  | |__ | | | __| | __| | ___  ___| |_ ___| |__   __ _| |_ __ _  ',
      " |  _ < / _` | __| '_ \\| '_ \\ | '_ \\| | |/ _` |/ _` |/ _ \\/ __| __/ __| '_ \\ / _` | __/ _` |",
      ' | |_) | (_| | |_| | | | |_) | | |_) | | | (_| | (_| |  __/ (__| || (__| | | | (_| | || (_| |',
      ' |____/ \\__,_|\\__|_| |_|_.__/ |_.__/|_|_|\\__,_|\\__,_|\\___|\\___|\\__\\___|_| |_|\\__,_|\\__\\__,_|',
      '\x1b[0m',
      ''
    ].join('\n');
  }
}
````

## File: src/components/terminal/commands/ClearCommand.ts
````typescript
import { Command } from './Command';

export class ClearCommand extends Command {
  name = 'clear';
  description = 'Clear the terminal screen';
  usage = 'clear';

  execute(): string {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('quake-clear', { detail: {} });
      window.dispatchEvent(event);
    }
    return '';
  }
}
````

## File: src/components/terminal/commands/Command.ts
````typescript
export abstract class Command {
    abstract name: string
    abstract description: string
    abstract usage: string
  
    abstract execute(args: string[]): string | Promise<string>
  
    help(): string {
      return `${this.name} - ${this.description}\nUsage: ${this.usage}`
    }
  }
````

## File: src/components/terminal/commands/ExitCommand.ts
````typescript
import { Command } from './Command'

export class ExitCommand extends Command {
  name = 'exit'
  description = 'Close the terminal and clear history'
  usage = 'exit'

  execute(): string {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('quake-exit', { detail: { clear: true } })
      window.dispatchEvent(event)
    }

    return 'Closing terminal...'
  }
}
````

## File: src/components/terminal/commands/FortuneCommand.ts
````typescript
import { Command } from './Command'

const FORTUNES = [
  'The quieter you become, the more you are able to hear. – Kali Linux',
  'There is no patch for human stupidity. – Kevin Mitnick',
  'Hack the planet!',
  'With great power comes great responsibility.',
  'Security is not a product, but a process. – Bruce Schneier',
  'grep life /dev/urandom',
  'To err is human, to really foul things up you need a computer.',
  'rm -rf /fear',
  'Stay paranoid, stay safe.',
  '0xCAFEBABE',
  'root@battlewithbytes:~#',
  'There are only two types of companies: those that have been hacked, and those that will be. – Robert Mueller',
];

export class FortuneCommand extends Command {
  name = 'fortune';
  description = 'Print a random hacker/cybersecurity fortune';
  usage = 'fortune';

  execute(): string {
    const idx = Math.floor(Math.random() * FORTUNES.length);
    return FORTUNES[idx];
  }
}
````

## File: src/components/terminal/commands/HelpCommand.ts
````typescript
import { Command } from './Command'
import { loadCommands } from '../CommandRegistry'

export class HelpCommand extends Command {
  name = 'help'
  description = 'List available commands'
  usage = 'help'

  execute(): string {
    const registry = loadCommands()

    let output = 'Available Commands:\n'

    Object.values(registry).forEach((cmd) => {
      output += `- ${cmd.name}: ${cmd.description}\n`
    })

    return output
  }
}
````

## File: src/components/terminal/commands/LsCommand.ts
````typescript
import { Command } from './Command'

interface BlogPost {
  slug: string;
  metadata: {
    title: string;
    date: string;
    tags: string[];
    excerpt: string;
    author: string;
    [key: string]: string | string[] | number | boolean | undefined;
  };
}

export class LsCommand extends Command {
  name = 'ls'
  description = 'List blog posts'
  usage = 'ls [blogs]'

  async execute(args: string[]): Promise<string> {
    // If no arguments or first argument is 'blogs', list blog posts
    if (args.length === 0 || args[0] === 'blogs') {
      return this.listBlogs();
    } else {
      return `Unknown argument: ${args[0]}\nUsage: ${this.usage}`;
    }
  }

  private async listBlogs(): Promise<string> {
    try {
      // Fetch blog data from the generated JSON file
      const response = await fetch('/blog-data.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blog data: ${response.statusText}`);
      }
      
      const posts: BlogPost[] = await response.json();
      
      if (!posts || posts.length === 0) {
        return 'No blog posts found.';
      }
      
      // Sort posts by date (newest first)
      posts.sort((a, b) => {
        const dateA = new Date(a.metadata.date || '');
        const dateB = new Date(b.metadata.date || '');
        return dateB.getTime() - dateA.getTime();
      });
      
      // Format the output
      let output = 'BATTLE WITH BYTES - Blog Posts\n\n';
      output += 'SLUG                      DATE            TAGS\n';
      output += '------------------------------------------------------\n';
      
      // Display the posts in a simple format
      posts.forEach((post) => {
        const slug = post.slug.padEnd(25);
        const date = (post.metadata.date || 'N/A').padEnd(15);
        const tags = Array.isArray(post.metadata.tags) 
          ? post.metadata.tags.map(tag => `#${tag}`).join(' ')
          : 'No tags';
        
        output += `${slug} ${date} ${tags}\n`;
      });
      
      output += `\nTotal: ${posts.length} blog posts`;
      
      return output;
    } catch (error) {
      return `ERROR: ${(error as Error).message}`;
    }
  }
}
````

## File: src/components/terminal/commands/PowerCommand.ts
````typescript
import { Command } from './Command'

export class PowerCommand extends Command {
  name = 'power'
  description = 'Calculate power using Ohm’s Law (P = V * I)'
  usage = 'power <voltage> <current>'

  execute(args: string[]): string {
    if (args.length !== 2) {
      return `Invalid args.\nUsage: ${this.usage}`
    }

    const voltage = parseFloat(args[0])
    const current = parseFloat(args[1])

    if (isNaN(voltage) || isNaN(current)) {
      return 'Error: voltage and current must be numbers.'
    }

    const power = voltage * current
    return `Power = ${power.toFixed(2)} watts`
  }
}
````

## File: src/components/terminal/commands/SudoCommand.ts
````typescript
import { Command } from './Command'

export class SudoCommand extends Command {
  name = 'sudo'
  description = 'Try to execute a command as root (for fun)'
  usage = 'sudo [command]'

  execute(args: string[]): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    return 'Permission denied: You are not root!';
  }
}
````

## File: src/components/terminal/CommandRegistry.ts
````typescript
import { PowerCommand } from './commands/PowerCommand'
import { HelpCommand } from  './commands/HelpCommand'
import { ExitCommand } from './commands/ExitCommand'
import { LsCommand } from './commands/LsCommand'
import { Command } from './commands/Command'
import { BannerCommand } from './commands/BannerCommand'
import { SudoCommand } from './commands/SudoCommand'
import { FortuneCommand } from './commands/FortuneCommand'
import { ClearCommand } from './commands/ClearCommand'

export const loadCommands = (): Record<string, Command> => {
  const commands: Command[] = [
    new HelpCommand(),
    new PowerCommand(), 
    new ExitCommand(),
    new LsCommand(),
    new BannerCommand(),
    new SudoCommand(),
    new FortuneCommand(),
    new ClearCommand(),
  ]

  const commandMap: Record<string, Command> = {}

  commands.forEach(cmd => {
    commandMap[cmd.name] = cmd
  })

  return commandMap
}
````

## File: src/components/tools/MosfetCalculator/Description.tsx
````typescript
'use client';

import React, { useState } from 'react';

interface DescriptionProps {
  description: string;
  conducting: boolean | null;
  voltageAcrossLoad: string;
  powerDissipated: string;
  currentThroughLoad: string;
  vgs: string;
  id: string;
  vd: string;
  mosfetDetails: {
    rds_on?: string;
    vgs_th?: string;
    type?: string;
    [key: string]: string | undefined;
  } | null;
  mosfetType: string;
  loadResistance: number | null;
}

export default function Description({
  description,
  conducting,
  voltageAcrossLoad,
  powerDissipated,
  currentThroughLoad,
  vgs,
  id,
  vd,
  mosfetDetails,
  mosfetType,
  loadResistance
}: DescriptionProps) {
  const [showMath, setShowMath] = useState(false);

  // Don't render anything if there's no description or description is empty
  if (!description || description.trim() === '') {
    return null;
  }

  // Generate the mathematical calculations explanation
  const generateMathExplanation = () => {
    if (!conducting && conducting !== false) return null;
    
    const vgsNum = parseFloat(vgs);
    const idNum = parseFloat(id);
    const vdNum = parseFloat(vd);
    const voltageAcrossLoadNum = parseFloat(voltageAcrossLoad);
    // These variables are declared but not used in the component
    // const currentThroughLoadNum = parseFloat(currentThroughLoad);
    // const powerDissipatedNum = parseFloat(powerDissipated);
    
    // This calculation is not used in the component
    // const recalculatedPower = idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0');
    
    return (
      <div className="math-explanation bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm mt-4">
        <h4 className="text-green-400 mb-2 text-lg">Mathematical Calculations:</h4>
        
        <div className="mb-3">
          <div className="text-gray-400">Gate-Source Voltage (Vgs):</div>
          <div className="text-white">Vgs = Vg - Vs = {vgsNum.toFixed(2)} V</div>
        </div>
        
        {conducting ? (
          <>
            <div className="mb-3">
              <div className="text-gray-400">Current through circuit (Id):</div>
              {mosfetType === 'n-channel' ? (
                <div className="text-white">Id = Vcc / (Rds_on + {loadResistance?.toFixed(2) ?? '?'}) = {idNum.toFixed(4)} A</div>
              ) : (
                <div className="text-white">Id = Vs / (Rds_on + {loadResistance?.toFixed(2) ?? '?'}) = {idNum.toFixed(4)} A</div>
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Voltage across load:</div>
              <div className="text-white">Vload = Id × Rload ({loadResistance?.toFixed(2) ?? '?'}) = {voltageAcrossLoadNum.toFixed(4)} V</div>
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Voltage at drain (Vd):</div>
              {/* Conditional Vd formula based on type */}
              {mosfetType === 'n-channel' ? (
                <div className="text-white">Vd (N-Ch) = Vcc - Vload = {vdNum.toFixed(4)} V</div> 
              ) : (
                <div className="text-white">Vd = Vload = {vdNum.toFixed(4)} V</div> 
                // Alternate display: Vd = Vs - (Id * Rds_on) = {vdNum.toFixed(4)} V
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Power dissipated by MOSFET:</div>
              <div className="text-white">
                P = Id² × Rds_on ({parseFloat(mosfetDetails?.rds_on || '0').toFixed(2)}Ω) = ({idNum.toFixed(4)} A)² × Rds_on = {(idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')).toFixed(6)} W 
                {(idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')) < 0.001 && ` (${((idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')) * 1000).toFixed(2)} mW)`}
              </div>
            </div>
          </>
        ) : (
          <div className="mb-3">
            <div className="text-gray-400">Since Vgs {vgsNum < 0 ? '>' : '<'} Vth, the MOSFET is in cutoff mode:</div>
            <div className="text-white">Id = 0 A</div>
            <div className="text-white">Vload = 0 V</div>
            <div className="text-white">Power dissipated = 0 W</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="description-container">
      <h3 className="text-xl font-bold mb-4 text-center">
        {conducting !== null && (
          <span className={conducting ? 'text-green-400' : 'text-red-400'}>
            MOSFET is {conducting ? 'CONDUCTING' : 'NOT CONDUCTING'}
          </span>
        )}
      </h3>
      
      <div className={`mosfet-output mb-4 ${conducting !== null ? (conducting ? 'conducting' : 'not-conducting') : ''}`}>
        {description}
      </div>
      
      {(voltageAcrossLoad || powerDissipated || currentThroughLoad || vgs || id || vd) && (
        <>
          <div className="results-grid">
            {vgs && (
              <div className="result-item">
                <div className="result-label">Gate-Source Voltage (Vgs)</div>
                <div className="result-value">{vgs} V</div>
              </div>
            )}
            
            {id && (
              <div className="result-item">
                <div className="result-label">Drain Current (Id)</div>
                <div className="result-value">{id} A</div>
              </div>
            )}
            
            {vd && (
              <div className="result-item">
                <div className="result-label">Drain Voltage (Vd)</div>
                <div className="result-value">{vd} V</div>
              </div>
            )}
            
            {voltageAcrossLoad && (
              <div className="result-item">
                <div className="result-label">Voltage Across Load</div>
                <div className="result-value">{voltageAcrossLoad} V</div>
              </div>
            )}
            
            {currentThroughLoad && (
              <div className="result-item">
                <div className="result-label">Current Through Load</div>
                <div className="result-value">{currentThroughLoad} A</div>
              </div>
            )}
            
            {powerDissipated && (
              <div className="result-item">
                <div className="result-label">Power Dissipated</div>
                <div className="result-value text-green-400">{powerDissipated}</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              className="mosfet-button w-auto px-4"
              onClick={() => setShowMath(!showMath)}
            >
              {showMath ? 'Hide Calculations' : 'Show Calculations'}
            </button>
          </div>
          
          {showMath && generateMathExplanation()}
        </>
      )}
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/index.tsx
````typescript
'use client';

import React, { useState, useEffect } from 'react';
import { calculateNChannelConduction, calculatePChannelConduction, parseSiPrefixedValue } from './mosfetUtils';
import MosfetTypeSelector from './MosfetTypeSelector';
import MosfetDiagram from './MosfetDiagram';
import NChannelMosfetConfiguration from './NChannelMosfetConfiguration';
import PChannelMosfetConfiguration from './PChannelMosfetConfiguration';
import Description from './Description';
import './styles.css';

interface InputValues {
  vg: string;
  vcc: string;
  vd: string;
  vs: string;
  loadResistance: string;
}

interface MosfetDetails {
  vth: string;
  rds_on: string;
  vgs_th?: string;
  type?: string;
  [key: string]: string | undefined;
}

export default function MosfetCalculator() {
  const [mosfetType, setMosfetType] = useState<string>('n-channel');
  const [mosfetName, setMosfetName] = useState<string>('');
  const [mosfetDetails, setMosfetDetails] = useState<MosfetDetails>({ vth: '', rds_on: '' });
  const [inputValues, setInputValues] = useState<InputValues>({
    vg: '',
    vcc: '',
    vd: '',
    vs: '0',
    loadResistance: ''
  });
  const [description, setDescription] = useState<string>('');
  const [conducting, setConducting] = useState<boolean | null>(null);
  const [voltageAcrossLoad, setVoltageAcrossLoad] = useState<string>('');
  const [powerDissipated, setPowerDissipated] = useState<string>('');
  const [currentThroughLoad, setCurrentThroughLoad] = useState<string>('');
  const [vgs, setVgs] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [vd, setVd] = useState<string>('');
  const [numericLoadResistance, setNumericLoadResistance] = useState<number | null>(null);

  const handleMosfetTypeChange = (type: string) => {
    setMosfetType(type);
    setMosfetName('');
    setMosfetDetails({ vth: '', rds_on: '' });
    setInputValues({
      vg: '',
      vcc: '',
      vd: '',
      vs: '0',
      loadResistance: ''
    });
    setDescription('');
    setConducting(null);
    setVoltageAcrossLoad('');
    setPowerDissipated('');
    setCurrentThroughLoad('');
    setVgs('');
    setId('');
    setVd('');
    setNumericLoadResistance(null);
  };

  const handleMosfetDetailsChange = (name: string, details: MosfetDetails) => {
    setMosfetName(name);
    setMosfetDetails(details);
  };

  const handleInputChange = (name: string, value: string) => {
    setInputValues({ ...inputValues, [name]: value });
  };

  useEffect(() => {
    const vth = parseFloat(mosfetDetails.vth);
    const rds_on = parseSiPrefixedValue(mosfetDetails.rds_on);
    const vg = parseFloat(inputValues.vg);
    const vs = parseFloat(inputValues.vs);
    const loadResistanceNum = parseSiPrefixedValue(inputValues.loadResistance);

    setNumericLoadResistance(isNaN(loadResistanceNum) ? null : loadResistanceNum);

    let vccNum = NaN;
    if (mosfetType === 'n-channel') {
      vccNum = parseFloat(inputValues.vcc);
    }

    const hasRequiredDetails = !isNaN(vth) && !isNaN(rds_on);
    const hasRequiredInputs = mosfetType === 'n-channel' 
        ? !isNaN(vg) && !isNaN(vs) && !isNaN(vccNum) && !isNaN(loadResistanceNum)
        : !isNaN(vg) && !isNaN(vs) && !isNaN(loadResistanceNum);

    const hasNChannelPower = mosfetType === 'n-channel' && !isNaN(vccNum);
    const hasPChannelPower = mosfetType === 'p-channel';

    if (hasRequiredDetails && hasRequiredInputs && (hasNChannelPower || hasPChannelPower)) {
      let results;
      if (mosfetType === 'n-channel') {
        results = calculateNChannelConduction(vth, vg, vs, vccNum, loadResistanceNum, rds_on);
      } else {
        results = calculatePChannelConduction(vth, vg, vs, loadResistanceNum, rds_on);
      }

      setDescription(results.description || '');
      setConducting(results.conducting);
      setVoltageAcrossLoad(results.voltageAcrossLoad || '');
      setPowerDissipated(results.powerDissipated || '');
      setCurrentThroughLoad(results.currentThroughLoad || '');
      setVgs(results.vgs || '');
      setId(results.id || '');
      setVd(results.vd || '');
    } else {
      setDescription('Please select a MOSFET and provide valid numeric input values.');
      setConducting(null);
      setVoltageAcrossLoad('');
      setPowerDissipated('');
      setCurrentThroughLoad('');
      setVgs('');
      setId('');
      setVd('');
    }
  }, [mosfetType, inputValues, mosfetDetails]);

  return (
    <div className="mosfet-calculator">
      <div className="mosfet-container">
        <div className="mosfet-left-section">
          <MosfetTypeSelector mosfetType={mosfetType} onTypeChange={handleMosfetTypeChange} />
          <MosfetDiagram mosfetType={mosfetType} inputValues={inputValues} /> 
        </div>
        <div className="mosfet-right-section">
          {mosfetType === 'n-channel' ? (
            <NChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          ) : (
            <PChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          )}
        </div>
      </div>
      <Description 
        description={description} 
        conducting={conducting} 
        voltageAcrossLoad={voltageAcrossLoad} 
        powerDissipated={powerDissipated} 
        currentThroughLoad={currentThroughLoad} 
        vgs={vgs}
        id={id}
        vd={vd}
        mosfetDetails={mosfetDetails}
        mosfetType={mosfetType}
        loadResistance={numericLoadResistance} 
      />
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/mosfetData.json
````json
{
  "mosfets": {
    "n-channel": {
      "IRLZ44N": {
        "vth": 1,
        "rds_on": 0.022,
        "Id": "47A",
        "P_max": "94W",
        "Vds_max": "55V",
        "Vgs_max": "20V"
      },
      "BSS138": {
        "vth": 0.8,
        "rds_on": 3.5,
        "Id": "220mA",
        "P_max": "360mW",
        "Vds_max": "50V",
        "Vgs_max": "20V"
      },
      "2N7002K": {
        "vth": 0.8,
        "rds_on": 3.5,
        "Id": "380mA",
        "P_max": "200mW",
        "Vds_max": "60V",
        "Vgs_max": "20V"
      },
      "IRLB3034PBF": {
        "vth": 1.35,
        "rds_on": 0.0018,
        "Id": "195A",
        "P_max": "375W",
        "Vds_max": "60V",
        "Vgs_max": "20V"
      },
      "STP75NF75": {
        "vth": 2,
        "rds_on": 0.009,
        "Id": "80A",
        "P_max": "300W",
        "Vds_max": "75V",
        "Vgs_max": "20V"
      },
      "IRF3205": {
        "vth": 2,
        "rds_on": 0.008,
        "Id": "110A",
        "P_max": "200W",
        "Vds_max": "55V",
        "Vgs_max": "20V"
      },
      "IRL540N": {
        "vth": 1,
        "rds_on": 0.044,
        "Id": "36A",
        "P_max": "150W",
        "Vds_max": "100V",
        "Vgs_max": "20V"
      }
    },
    "p-channel": {
      "IRF9540N": {
        "vth": -3,
        "rds_on": 0.117,
        "Id": "23A",
        "P_max": "140W",
        "Vds_max": "-100V",
        "Vgs_max": "20V"
      },
      "IRF5305": {
        "vth": -2,
        "rds_on": 0.065,
        "Id": "22A",
        "P_max": "70W",
        "Vds_max": "-55V",
        "Vgs_max": "20V"
      },
      "IRF5210": {
        "vth": -2,
        "rds_on": 0.045,
        "Id": "40A",
        "P_max": "200W",
        "Vds_max": "-100V",
        "Vgs_max": "20V"
      },
      "AO3401": {
        "vth": -1.5,
        "rds_on": 0.03,
        "Id": "4A",
        "P_max": "1.4W",
        "Vds_max": "-30V",
        "Vgs_max": "20V"
      },
      "SI2301": {
        "vth": -2,
        "rds_on": 0.1,
        "Id": "2.1A",
        "P_max": "1.25W",
        "Vds_max": "-20V",
        "Vgs_max": "12V"
      }
    }
  }
}
````

## File: src/components/tools/MosfetCalculator/MosfetDiagram.tsx
````typescript
'use client';

import React from 'react';

interface MosfetDiagramProps {
  mosfetType: string;
  inputValues: {
    vg: string;
    vcc: string;
    vd: string;
    vs: string;
    loadResistance: string;
  };
}

export default function MosfetDiagram({ mosfetType, inputValues }: MosfetDiagramProps) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Circuit Diagram</h3>
      <div className="mosfet-diagram">
        {mosfetType === 'n-channel' ? (
          <div className="relative w-full h-64 bg-black/30 rounded-lg p-4">
            <svg viewBox="0 0 300 200" className="w-full h-full">
              {/* VCC Connection */}
              <line x1="150" y1="20" x2="150" y2="50" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Load Resistor */}
              <path d="M150,50 L140,55 L160,65 L140,75 L160,85 L140,95 L160,105 L150,110" fill="none" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Resistor Value */}
              {inputValues.loadResistance && (
                <text x="170" y="80" fill="#00ff9d" className="text-sm font-mono">
                  {inputValues.loadResistance}Ω
                </text>
              )}
              
              {/* VCC Label */}
              <text x="135" y="10" fill="#ff5555" className="text-sm font-mono">
                {inputValues.vcc ? `${inputValues.vcc}V` : 'VCC'}
              </text>
              
              {/* N-Channel Enhancement MOSFET Symbol (Wikipedia style) */}
              {/* Drain Connection */}
              <line x1="150" y1="110" x2="150" y2="125" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Source Connection */}
              <line x1="150" y1="175" x2="150" y2="190" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Connection */}
              <line x1="100" y1="150" x2="130" y2="150" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Channel Line */}
              <line x1="150" y1="125" x2="150" y2="175" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate */}
              <line x1="130" y1="135" x2="130" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Insulation Gap */}
              <line x1="130" y1="150" x2="140" y2="150" stroke="transparent" strokeWidth="2" />
              
              {/* Substrate/Body */}
              <line x1="140" y1="135" x2="140" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Substrate Connection */}
              <line x1="140" y1="150" x2="145" y2="150" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Three parallel lines representing the channel */}
              <line x1="140" y1="135" x2="150" y2="135" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="150" x2="150" y2="150" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="165" x2="150" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Arrow indicating N-Channel (pointing inward) */}
              <polygon points="145,155 150,150 145,145" fill="#00ff9d" stroke="#00ff9d" strokeWidth="1" />
              
              {/* Ground Symbol */}
              <line x1="150" y1="190" x2="150" y2="195" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="195" x2="160" y2="195" stroke="#00ff9d" strokeWidth="2" />
              <line x1="143" y1="200" x2="157" y2="200" stroke="#00ff9d" strokeWidth="2" />
              <line x1="146" y1="205" x2="154" y2="205" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Label */}
              <text x="80" y="150" fill="#00ff9d" className="text-sm font-mono" textAnchor="end">
                G {inputValues.vg ? `(${inputValues.vg}V)` : ''}
              </text>
              
              {/* Drain Label */}
              <text x="170" y="125" fill="#ffffff" className="text-sm font-mono" textAnchor="start">
                D {inputValues.vd ? `(${inputValues.vd}V)` : ''}
              </text>
              
              {/* Source Label */}
              <text x="170" y="175" fill="#ff9900" className="text-sm font-mono" textAnchor="start">
                S {inputValues.vs ? `(${inputValues.vs}V)` : '(0V)'}
              </text>
            </svg>
          </div>
        ) : (
          <div className="relative w-full h-64 bg-black/30 rounded-lg p-4">
            <svg viewBox="0 0 300 200" className="w-full h-full">
              {/* VCC Connection */}
              <line x1="150" y1="20" x2="150" y2="25" stroke="#00ff9d" strokeWidth="2" />
              
              {/* P-Channel Enhancement MOSFET Symbol (Wikipedia style) */}
              {/* Source Connection */}
              <line x1="150" y1="25" x2="150" y2="40" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Drain Connection */}
              <line x1="150" y1="90" x2="150" y2="110" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Connection */}
              <line x1="100" y1="65" x2="130" y2="65" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Channel Line */}
              <line x1="150" y1="40" x2="150" y2="90" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate */}
              <line x1="130" y1="50" x2="130" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Insulation Gap */}
              <line x1="130" y1="65" x2="140" y2="65" stroke="transparent" strokeWidth="2" />
              
              {/* Substrate/Body */}
              <line x1="140" y1="50" x2="140" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Substrate Connection */}
              <line x1="140" y1="65" x2="145" y2="65" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Three parallel lines representing the channel */}
              <line x1="140" y1="50" x2="150" y2="50" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="65" x2="150" y2="65" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="80" x2="150" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Arrow indicating P-Channel (pointing outward) */}
              <polygon points="145,55 140,65 145,75" fill="#00ff9d" stroke="#00ff9d" strokeWidth="1" />
              
              {/* VCC Label */}
              <text x="135" y="10" fill="#ff5555" className="text-sm font-mono">
                {inputValues.vcc ? `${inputValues.vcc}V` : 'VCC'}
              </text>
              
              {/* Load Resistor */}
              <path d="M150,110 L140,115 L160,125 L140,135 L160,145 L140,155 L160,165 L150,170" fill="none" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Resistor Value */}
              {inputValues.loadResistance && (
                <text x="170" y="140" fill="#00ff9d" className="text-sm font-mono">
                  {inputValues.loadResistance}Ω
                </text>
              )}
              
              {/* Ground Symbol */}
              <line x1="150" y1="170" x2="150" y2="180" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="180" x2="160" y2="180" stroke="#00ff9d" strokeWidth="2" />
              <line x1="143" y1="185" x2="157" y2="185" stroke="#00ff9d" strokeWidth="2" />
              <line x1="146" y1="190" x2="154" y2="190" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Label */}
              <text x="80" y="65" fill="#00ff9d" className="text-sm font-mono" textAnchor="end">
                G {inputValues.vg ? `(${inputValues.vg}V)` : ''}
              </text>
              
              {/* Source Label */}
              <text x="170" y="40" fill="#ff9900" className="text-sm font-mono" textAnchor="start">
                S {inputValues.vs ? `(${inputValues.vs}V)` : ''}
              </text>
              
              {/* Drain Label */}
              <text x="170" y="90" fill="#ffffff" className="text-sm font-mono" textAnchor="start">
                D {inputValues.vd ? `(${inputValues.vd}V)` : ''}
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/MosfetTypeSelector.tsx
````typescript
'use client';

import React from 'react';

interface MosfetTypeSelectorProps {
  mosfetType: string;
  onTypeChange: (type: string) => void;
}

export default function MosfetTypeSelector({ mosfetType, onTypeChange }: MosfetTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">MOSFET Type</h3>
      <div className="type-selector">
        <button
          className={`type-button ${mosfetType === 'n-channel' ? 'active' : ''}`}
          onClick={() => onTypeChange('n-channel')}
        >
          N-Channel
        </button>
        <button
          className={`type-button ${mosfetType === 'p-channel' ? 'active' : ''}`}
          onClick={() => onTypeChange('p-channel')}
        >
          P-Channel
        </button>
      </div>
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/mosfetUtils.test.ts
````typescript
import { calculateNChannelConduction, calculatePChannelConduction } from './mosfetUtils';

describe('MOSFET Calculations', () => {
  describe('N-Channel MOSFET', () => {
    test('N-Channel MOSFET conducting state', () => {
      // Test case 1: Standard N-Channel MOSFET in conducting state
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 0.1);
      
      // Calculate expected values
      const expectedVgs = '5.00';
      const expectedId = '0.1199';
      const expectedVd = '0.0120';
      const expectedVoltageAcrossLoad = '11.9880';
      const expectedCurrentThroughLoad = '0.1199';
      const expectedRawPower = 0.1199 * 0.1199 * 0.1;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
    });

    test('N-Channel MOSFET cutoff state', () => {
      // Test case 2: N-Channel MOSFET in cutoff state
      // Vth = 2V, Vg = 1V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 1, 0, 12, 100, 0.1);
      
      // Check results
      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe('1.00');
      expect(result.id).toBe('0.0000');
      expect(result.vd).toBe('12.0000');
      expect(result.voltageAcrossLoad).toBe('0.0000');
      expect(result.currentThroughLoad).toBe('0.0000');
      expect(result.rawPowerDissipated).toBe(0);
    });

    test('N-Channel MOSFET with very low Rds_on', () => {
      // Test case 3: N-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculateNChannelConduction(2, 5, 0, 25, 225, 0.022);
      
      // Calculate expected values
      const expectedVgs = '5.00';
      const expectedId = '0.1110';
      const expectedVd = '0.0024';
      const expectedVoltageAcrossLoad = '24.9976';
      const expectedCurrentThroughLoad = '0.1110';
      const expectedRawPower = 0.1110 * 0.1110 * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit conversion for small values
      expect(result.powerUnit).toBe('mW');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower * 1000, 2);
    });

    test('N-Channel MOSFET with high Rds_on', () => {
      // Test case 4: N-Channel MOSFET with high Rds_on (10Ω)
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 10);
      
      // Calculate expected values
      const expectedVgs = '5.00';
      const expectedId = '0.1091';
      const expectedVd = '1.0910';
      const expectedVoltageAcrossLoad = '10.9100';
      const expectedCurrentThroughLoad = '0.1091';
      const expectedRawPower = 0.1091 * 0.1091 * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
    });
  });

  describe('P-Channel MOSFET', () => {
    test('P-Channel MOSFET conducting state', () => {
      // Test case 5: Standard P-Channel MOSFET in conducting state
      // Vth = -2V, Vg = 0V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 0, 12, 12, 100, 0.1);
      
      // Calculate expected values
      const expectedVgs = '-12.00';
      const expectedId = '0.1199';
      const expectedVd = '11.9880';
      const expectedVoltageAcrossLoad = '11.9880';
      const expectedCurrentThroughLoad = '0.1199';
      const expectedRawPower = 0.1199 * 0.1199 * 0.1;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
    });

    test('P-Channel MOSFET cutoff state', () => {
      // Test case 6: P-Channel MOSFET in cutoff state
      // Vth = -2V, Vg = 12V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 12, 12, 12, 100, 0.1);
      
      // Check results
      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe('0.00');
      expect(result.id).toBe('0.0000');
      expect(result.vd).toBe('0.0000');
      expect(result.voltageAcrossLoad).toBe('0.0000');
      expect(result.currentThroughLoad).toBe('0.0000');
      expect(result.rawPowerDissipated).toBe(0);
    });

    test('P-Channel MOSFET with very low Rds_on', () => {
      // Test case 7: P-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = -2V, Vg = 0V, Vs = 25V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculatePChannelConduction(-2, 0, 25, 25, 225, 0.022);
      
      // Calculate expected values
      const expectedVgs = '-25.00';
      const expectedId = '0.1110';
      const expectedVd = '24.9976';
      const expectedVoltageAcrossLoad = '24.9976';
      const expectedCurrentThroughLoad = '0.1110';
      const expectedRawPower = 0.1110 * 0.1110 * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit conversion for small values
      expect(result.powerUnit).toBe('mW');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower * 1000, 2);
    });

    test('P-Channel MOSFET with high Rds_on', () => {
      // Test case 8: P-Channel MOSFET with high Rds_on (10Ω)
      // Vth = -2V, Vg = 0V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculatePChannelConduction(-2, 0, 12, 12, 100, 10);
      
      // Calculate expected values
      const expectedVgs = '-12.00';
      const expectedId = '0.1091';
      const expectedVd = '10.9100';
      const expectedVoltageAcrossLoad = '10.9100';
      const expectedCurrentThroughLoad = '0.1091';
      const expectedRawPower = 0.1091 * 0.1091 * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
    });
  });

  describe('Edge Cases', () => {
    test('N-Channel MOSFET with Vgs exactly at threshold', () => {
      // Test case 9: N-Channel MOSFET with Vgs exactly at threshold
      // Vth = 2V, Vg = 2V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 2, 0, 12, 100, 0.1);
      
      // Check results - should be in cutoff state
      expect(result.conducting).toBe(false);
    });

    test('P-Channel MOSFET with Vgs exactly at threshold', () => {
      // Test case 10: P-Channel MOSFET with Vgs exactly at threshold
      // Vth = -2V, Vg = 10V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 10, 12, 12, 100, 0.1);
      
      // Check results - should be in cutoff state
      expect(result.conducting).toBe(false);
    });
  });
});
````

## File: src/components/tools/MosfetCalculator/mosfetUtils.ts
````typescript
'use client';

// SI Prefix parsing function
export const parseSiPrefixedValue = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return NaN;
  }

  const trimmedValue = value.trim();
  const lastChar = trimmedValue.slice(-1);
  const numericPartStr = trimmedValue.slice(0, -1);

  const siPrefixes: { [key: string]: number } = {
    k: 1e3,
    M: 1e6,
    G: 1e9,
    m: 1e-3,
    u: 1e-6, // Micro
    n: 1e-9, // Nano
    p: 1e-12, // Pico
  };

  let multiplier = 1;
  let numericStrToParse = trimmedValue;

  // Check if the last character is a known SI prefix (case-insensitive)
  if (siPrefixes[lastChar.toLowerCase()]) {
    multiplier = siPrefixes[lastChar.toLowerCase()];
    numericStrToParse = numericPartStr;
  } else if (siPrefixes[lastChar]) { // Handle case-sensitive if needed (e.g., 'm' vs 'M') - though typically we treat k/M/G case-insensitively
      multiplier = siPrefixes[lastChar]; 
      numericStrToParse = numericPartStr;
  }

  const numericValue = parseFloat(numericStrToParse);

  if (isNaN(numericValue)) {
    return NaN; // Not a valid number
  }

  return numericValue * multiplier;
};


// N-Channel MOSFET calculations
export const calculateNChannelConduction = (
  vth: number,
  vg: number,
  vs: number, // Source terminal voltage (often 0V / Ground)
  vcc: number, // Supply voltage connected *before* the load resistor
  loadResistance: number,
  rds_on: number
) => {
  // Assumes a standard N-Channel low-side switch configuration:
  // Vcc -> Load Resistor -> Drain, Source -> Vs (often Ground = 0V)
  // Current flows Vcc -> Load -> D -> S -> Vs when ON.

  const vgs = vg - vs;
  let conducting = false;
  let vd = 0; // Drain terminal voltage relative to ground/common
  let id = 0; // Drain current (flowing D->S)
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0; // Power dissipated *in the MOSFET*
  let description = '';

  if (vgs > vth) {
    conducting = true;

    // Calculate the voltage division between Rds_on and the load resistor.
    // The total voltage driving the current is Vcc - Vs.
    // If Vs is ground (0V), then voltage driver is just Vcc.
    const drivingVoltage = vcc - vs; // Voltage across the Vcc -> Load -> MOSFET -> Vs path
    const totalResistance = rds_on + loadResistance;

    // Prevent division by zero if totalResistance is somehow zero
    if (totalResistance <= 0) {
        id = 0; // Or handle as an error state
    } else {
       // Current flowing through the series path
       id = drivingVoltage / totalResistance;
    }

    // Calculate Drain voltage relative to ground/common (Vs is the reference for Source)
    // Vd = Voltage drop across Rds_on + Vs
    vd = id * rds_on + vs;
    voltageAcrossLoad = id * loadResistance; // Voltage drop across the load
    currentThroughLoad = id; // Current through load is the drain current
    powerDissipated = id * id * rds_on; // Power in MOSFET = Ids^2 * Rds_on

    description = `The N-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is greater than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from drain to source, allowing current through the load.`;

  } else {
    // Cutoff state
    conducting = false;
    // When off, Drain voltage is pulled up to Vcc via the load resistor (assuming load connects D to Vcc)
    // No, wait - Drain is between Load and MOSFET. If MOSFET is open, Vd = Vs because no current flows through Rds_on?
    // No, if MOSFET is open circuit (D-S), no current flows through Load either. Vd = Vcc (pulled up through load)
    vd = vcc; // Voltage at Drain node relative to ground/common
    id = 0;
    voltageAcrossLoad = 0; // No current through load
    currentThroughLoad = 0;
    powerDissipated = 0;

    description = `The N-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is less than or equal to Vth (${vth}V).\n\n`; // Added "or equal to"
    description += `The MOSFET is in cutoff mode, acting as an open circuit between Drain and Source.\n`;
    description += `No significant current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  let formattedPower = powerDissipated.toFixed(6);
  let powerUnit = 'W';
  if (powerDissipated < 0.001 && powerDissipated > 0) {
    formattedPower = (powerDissipated * 1000).toFixed(2);
    powerUnit = 'mW';
  }

  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4),
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower, // Now just the number part
    powerUnit: powerUnit,           // Unit separate
    rawPowerDissipated: powerDissipated,
    description
  };
};


// P-Channel MOSFET calculations
export const calculatePChannelConduction = (
  vth: number, // Expected to be negative for P-channel
  vg: number,
  vs: number, // Source terminal voltage (often Vcc for high-side)
  loadResistance: number,
  rds_on: number
) => {
  // Assumes a standard P-Channel high-side switch configuration:
  // Vs (typically connected to Vcc) -> Source, Drain -> Load Resistor -> Ground (0V)
  // Current flows Vs -> S -> D -> Load -> Ground when ON.

  const vgs = vg - vs; // Will be negative when Vg < Vs
  let conducting = false;
  let vd = 0; // Drain terminal voltage relative to ground/common
  let id = 0; // Drain current (flowing S->D)
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0; // Power dissipated *in the MOSFET*
  let description = '';

  // For P-Channel, vth is negative and conduction occurs when vgs < vth
  if (vgs < vth) {
    conducting = true;

    // Calculate the voltage division between Rds_on and the load resistor.
    // The total voltage driving the current is Vs - Ground = Vs.
    const drivingVoltage = vs; // Voltage across the Vs -> MOSFET -> Load -> Ground path
    const totalResistance = rds_on + loadResistance;

     // Prevent division by zero
    if (totalResistance <= 0) {
        id = 0;
    } else {
        // Current flowing through the series path
        id = drivingVoltage / totalResistance;
    }

    // Calculate Drain voltage relative to ground/common
    // Vd = Vs - (Voltage drop across Rds_on) = Vs - (Id * Rds_on)
    // Alternatively Vd = voltage drop across Load = Id * loadResistance
    vd = id * loadResistance; // Drain voltage is the voltage across the load resistor
    // Let's double-check the previous calculation: vd = vs - (id * rds_on); This is also correct.
    // Let's use vd = vs - (id * rds_on) as it's defined relative to Vs.

    vd = vs - (id * rds_on); // Voltage at Drain node relative to ground/common
    voltageAcrossLoad = id * loadResistance; // Voltage drop across the load resistor
    currentThroughLoad = id; // Current through load is the drain current
    powerDissipated = id * id * rds_on; // Power in MOSFET = Ids^2 * Rds_on

    description = `The P-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is less than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from source to drain, allowing current through the load.`;
  } else {
    // Cutoff state
    conducting = false;
    // When off, no current flows. Drain is connected to Load, Load to Ground.
    // So, Drain voltage is pulled down to Ground (0V) through the load.
    vd = 0; // Voltage at Drain node relative to ground/common
    id = 0;
    voltageAcrossLoad = 0; // No current through load
    currentThroughLoad = 0;
    powerDissipated = 0;

    description = `The P-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is greater than or equal to Vth (${vth}V).\n\n`;
    description += `The MOSFET is in cutoff mode, acting as an open circuit between Source and Drain.\n`;
    description += `No significant current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  let formattedPower = powerDissipated.toFixed(6);
  let powerUnit = 'W';
   if (powerDissipated < 0.001 && powerDissipated > 0) {
    formattedPower = (powerDissipated * 1000).toFixed(2);
    powerUnit = 'mW';
  }


  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4), // Drain voltage relative to ground
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower, // Just the number part
    powerUnit: powerUnit,           // Unit separate
    rawPowerDissipated: powerDissipated,
    description
  };
};
````

## File: src/components/tools/MosfetCalculator/NChannelMosfetConfiguration.tsx
````typescript
'use client';

import React, { useState } from 'react';
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  isValidVoltage,
  getParameterWarning, 
  getParameterTooltip  
} from '../../../lib/utils/inputUtils';
import Tooltip from '../../../lib/utils/Tooltip';
import mosfetData from './mosfetData.json';

interface MosfetDetails {
  vth: number;
  rds_on: number;
  Id: string;
  P_max: string;
  Vds_max: string;
  Vgs_max: string;
}

interface NChannelMosfets {
  [key: string]: MosfetDetails;
}

interface NChannelMosfetConfigurationProps {
  mosfetName: string;
  mosfetDetails: { vth: string; rds_on: string };
  inputValues: {
    vg: string;
    vcc: string;
    vs: string;
    loadResistance: string;
  };
  onDetailsChange: (name: string, details: { vth: string; rds_on: string }) => void;
  onInputChange: (name: string, value: string) => void;
}

export default function NChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange
}: NChannelMosfetConfigurationProps) {
  const nChannelMosfets = mosfetData.mosfets['n-channel'] as NChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setWarnings({});
    if (selectedName === '') {
      onDetailsChange('', { vth: '', rds_on: '' });
      return;
    }

    if (selectedName === 'custom') {
      onDetailsChange(selectedName, { vth: '', rds_on: '' });
      return;
    }

    const selectedMosfet = nChannelMosfets[selectedName];
    onDetailsChange(selectedName, {
      vth: selectedMosfet.vth.toString(),
      rds_on: selectedMosfet.rds_on.toString()
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let isValid = true;
    if (name === 'loadResistance') {
    } else {
      isValid = isValidVoltage(value);
    }

    if (value === '' || isValid) {
      onInputChange(name, value);

      const warning = getParameterWarning(name, value);
      setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
  };

  const handleCustomParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let isValid = true;
    if (name === 'rds_on') {
    } else if (name === 'vth') {
      isValid = isValidVoltage(value);
    }

    if (value === '' || isValid) {
      onDetailsChange('custom', {...mosfetDetails, [name]: value});
      const warning = getParameterWarning(name, value);
      setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">N-Channel Configuration</h3>

      <div className="mosfet-inputs">
        <div>
          <label className="mosfet-label">Select MOSFET</label>
          <select
            className="mosfet-select"
            value={mosfetName}
            onChange={handleMosfetSelect}
          >
            <option value="">-- Select a MOSFET --</option>
            <option value="custom">-- Custom MOSFET --</option>
            {Object.keys(nChannelMosfets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {mosfetName === 'custom' ? (
          <>
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  name="vth"
                  className="mosfet-input"
                  value={mosfetDetails.vth}
                  onChange={handleCustomParamChange}
                  placeholder="Enter threshold voltage"
                />
              </Tooltip>
              {warnings.vth && <div className="text-yellow-400 text-sm mt-1">{warnings.vth}</div>}
            </div>

            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  name="rds_on"
                  className="mosfet-input"
                  value={mosfetDetails.rds_on}
                  onChange={handleCustomParamChange}
                  placeholder="Enter on resistance (e.g., 22m)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.rds_on && <div className="text-yellow-400 text-sm mt-1">{warnings.rds_on}</div>}
            </div>

            <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

            <div>
              <label className="mosfet-label">Supply Voltage (Vcc)</label>
              <Tooltip text={getParameterTooltip('vcc')}>
                <input
                  type="text"
                  name="vcc"
                  className="mosfet-input"
                  value={inputValues.vcc}
                  onChange={handleInputChange}
                  placeholder="Enter supply voltage"
                />
              </Tooltip>
              {warnings.vcc && <div className="text-yellow-400 text-sm mt-1">{warnings.vcc}</div>}
            </div>

            <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Usually 0V (ground)"
                />
              </Tooltip>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

            <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        ) : mosfetName && (
          <>
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseFloat(mosfetDetails.vth || 'NaN'), 'V')} 
                  readOnly
                />
              </Tooltip>
            </div>

            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseValueWithSuffix(mosfetDetails.rds_on || '0'), 'Ω')} 
                  readOnly
                />
              </Tooltip>
            </div>

            <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

            <div>
              <label className="mosfet-label">Supply Voltage (Vcc)</label>
              <Tooltip text={getParameterTooltip('vcc')}>
                <input
                  type="text"
                  name="vcc"
                  className="mosfet-input"
                  value={inputValues.vcc}
                  onChange={handleInputChange}
                  placeholder="Enter supply voltage"
                />
              </Tooltip>
              {warnings.vcc && <div className="text-yellow-400 text-sm mt-1">{warnings.vcc}</div>}
            </div>

            <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Usually 0V (ground)"
                />
              </Tooltip>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

            <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/PChannelMosfetConfiguration.tsx
````typescript
'use client';

import React, { useState, useCallback } from 'react';
import Tooltip from '../../../lib/utils/Tooltip';
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  // isValidNumberInput, // Less critical now, validation happens in useEffect
  // isValidResistance, // Can keep for basic input filtering if desired
  isValidVoltage,   // Can keep for basic input filtering if desired
  getParameterWarning, // Assuming these are correctly defined elsewhere
  getParameterTooltip  // Assuming these are correctly defined elsewhere
} from '../../../lib/utils/inputUtils';
import mosfetData from './mosfetData.json';

// --- Interfaces (Assume they are correct) ---
interface MosfetDetails {
    vth: number;
    rds_on: number;
    Id: string;
    P_max: string;
    Vds_max: string;
    Vgs_max: string;
  }

interface PChannelMosfets {
[key: string]: MosfetDetails;
}

interface PChannelMosfetConfigurationProps {
  mosfetName: string;
  mosfetDetails: { vth: string; rds_on: string };
  inputValues: {
    vg: string;
    vs: string;     // Vs is crucial for P-channel calculation
    loadResistance: string;
  };
  onDetailsChange: (name: string, details: { vth: string; rds_on: string }) => void;
  onInputChange: (name: string, value: string) => void;
}

// --- Component ---
// Use the interface for props
export default function PChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange
}: PChannelMosfetConfigurationProps) {
  const pChannelMosfets = mosfetData.mosfets['p-channel'] as PChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  // --- Event Handlers (Simplified) ---

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setWarnings({}); // Reset warnings
    if (selectedName === '') {
      onDetailsChange('', { vth: '', rds_on: '' });
      return;
    }
    if (selectedName === 'custom') {
      onDetailsChange(selectedName, { vth: '', rds_on: '' });
      return;
    }
    const selectedMosfet = pChannelMosfets[selectedName];
    onDetailsChange(selectedName, {
      vth: selectedMosfet.vth.toString(),
      rds_on: selectedMosfet.rds_on.toString()
    });
    // Calculation triggers via useEffect
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let isValid = true; // Assume valid initially or for empty string

    // Optional: Basic validation for immediate feedback
    if (value !== '') {
        if (name === 'loadResistance') {
            // isValid = isValidResistance(value); // Optional strict check
        } else if (['vg', 'vs'].includes(name)) {
             isValid = isValidVoltage(value);
        }
    }

    if (isValid) { // Update state only if potentially valid or empty
        onInputChange(name, value);
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
     // Calculation triggers via useEffect
  }, [onInputChange]);

  const handleCustomParamChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let isValid = true; // Assume valid initially or for empty string

    // Optional: Basic validation
     if (value !== '') {
        if (name === 'rds_on') {
            // isValid = isValidResistance(value); // Optional strict check
        } else if (name === 'vth') {
            isValid = isValidVoltage(value); // Check voltage format
        }
     }

    if (isValid) {
        onDetailsChange('custom', {...mosfetDetails, [name]: value});
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
    // Calculation triggers via useEffect
  }, [mosfetDetails, onDetailsChange]);

  // --- JSX Rendering (Using Tooltip component) ---
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">P-Channel Configuration</h3>

      <div className="mosfet-inputs">
        <div>
          <label className="mosfet-label">Select MOSFET</label>
          <select
            className="mosfet-select"
            value={mosfetName}
            onChange={handleMosfetSelect}
          >
            <option value="">-- Select a MOSFET --</option>
            <option value="custom">-- Custom MOSFET --</option>
            {Object.keys(pChannelMosfets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {mosfetName === 'custom' ? (
          <>
            {/* Vth Input */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  name="vth"
                  className="mosfet-input"
                  value={mosfetDetails.vth}
                  onChange={handleCustomParamChange}
                  placeholder="e.g., -2 (MUST be negative)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For P-Channel MOSFETs, Vth should be negative.</small>
              {warnings.vth && <div className="text-yellow-400 text-sm mt-1">{warnings.vth}</div>}
            </div>

            {/* Rds_on Input */}
             <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  name="rds_on"
                  className="mosfet-input"
                  value={mosfetDetails.rds_on}
                  onChange={handleCustomParamChange}
                  placeholder="Enter on resistance (e.g., 22m)"
                />
              </Tooltip>
               <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.rds_on && <div className="text-yellow-400 text-sm mt-1">{warnings.rds_on}</div>}
            </div>

            {/* Vg Input */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

            {/* Vs Input - Crucial for P-Channel */}
             <div>
              <label className="mosfet-label">Source Voltage (Vs - Connects to Supply)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Enter voltage at Source (usually Vcc)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For high-side switching, Vs is typically connected to the positive supply (Vcc).</small>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

            {/* Load Resistance Input */}
             <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        ) : mosfetName && (
          <>
            {/* Read-only Vth */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseFloat(mosfetDetails.vth || 'NaN'), 'V')} // Format value
                  readOnly
                />
              </Tooltip>
            </div>

            {/* Read-only Rds_on */}
            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseValueWithSuffix(mosfetDetails.rds_on || '0'), 'Ω')} // Format value
                  readOnly
                />
              </Tooltip>
            </div>

            {/* Editable Vg, Vs, LoadResistance */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

             <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Enter voltage at Source (usually Vcc)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For high-side switching, Vs is typically connected to the positive supply (Vcc).</small>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

             <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/tools/MosfetCalculator/styles.css
````css
/* MOSFET Calculator Styles - Adapted for Battle With Bytes cyber aesthetic */

.mosfet-calculator {
  font-family: var(--font-mono);
  color: var(--foreground);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem;
}

.mosfet-calculator .mosfet-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .mosfet-calculator .mosfet-container {
    flex-direction: row;
  }
}

.mosfet-calculator .mosfet-left-section, 
.mosfet-calculator .mosfet-right-section {
  flex: 1;
}

.mosfet-calculator .mosfet-diagram {
  position: relative;
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  white-space: pre;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #333;
}

.mosfet-calculator .image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Aspect ratio 1:1 */
}

.mosfet-calculator .scaled-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mosfet-calculator .mosfet-inputs {
  margin-top: 0.5rem;
}

.mosfet-calculator .mosfet-inputs div {
  margin-bottom: 0.5rem;
}

.mosfet-calculator .mosfet-label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--foreground);
}

.mosfet-calculator .mosfet-input,
.mosfet-calculator .mosfet-select,
.mosfet-calculator .mosfet-button {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  color: var(--foreground);
  font-family: var(--font-mono);
  border-radius: 4px;
}

/* Fix dropdown background color */
.mosfet-calculator select {
  background-color: var(--accent-purple);
  color: #18102b;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2rem;
}

/* Fix dropdown options */
.mosfet-calculator select option {
  background-color: #18102b;
  color: #ededed;
}

.mosfet-calculator .mosfet-input:focus,
.mosfet-calculator .mosfet-select:focus {
  border-color: var(--accent-purple);
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-purple);
}

.mosfet-calculator .mosfet-button {
  background-color: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  cursor: pointer;
  margin-top: 0.5rem;
}

.mosfet-calculator .mosfet-button:hover {
  background-color: var(--accent-primary);
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
}

.mosfet-calculator .description-container {
  width: 100%;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid #333;
  margin-top: 0.75rem;
}

.mosfet-calculator .mosfet-output {
  padding: 0.75rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  margin-bottom: 0.75rem;
  text-align: center;
}

.mosfet-calculator .mosfet-output.conducting {
  background-color: rgba(0, 255, 157, 0.1);
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.mosfet-calculator .mosfet-output.not-conducting {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff5555;
  border: 1px solid #ff5555;
}

.mosfet-calculator .overlay {
  position: absolute;
  font-weight: bold;
  color: var(--foreground);
}

.mosfet-calculator .conducting-status {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 10px;
  border-radius: 4px;
  text-align: center;
}

.mosfet-calculator .focused {
  border: 2px dashed var(--accent-primary);
  min-height: 2ch;
  min-width: 2ch;
}

/* N-Channel Specific Overlays */
.mosfet-calculator .nchannel-vcc {
  color: #ff5555;
  font-weight: bold;
  top: 5%;
  left: 50%;
}

.mosfet-calculator .n-channel_gate_green {
  top: 36%;
  left: 7%;
  font-weight: bold;
}

.mosfet-calculator .n-channel_drain_grey {
  top: 17%;
  left: 84%;
  font-weight: bold;
}

.mosfet-calculator .n-channel_source_orange {
  top: 50%;
  left: 88%;
  font-weight: bold;
}

/* P-Channel Specific Overlays */
.mosfet-calculator .p-channel_gate_green {
  top: 36%;
  left: 7%;
  font-weight: bold;
}

.mosfet-calculator .p-channel_drain_grey {
  top: 50%;
  left: 88%;
  font-weight: bold;
}

.mosfet-calculator .p-channel_source_orange {
  top: 17%;
  left: 84%;
  font-weight: bold;
}

.mosfet-calculator .type-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.mosfet-calculator .type-button {
  flex: 1;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid #333;
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mosfet-calculator .type-button.active {
  background-color: var(--accent-primary);
  color: #000;
  border-color: var(--accent-primary);
}

.mosfet-calculator .type-button:hover:not(.active) {
  border-color: var(--accent-primary);
}

.mosfet-calculator .results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.mosfet-calculator .result-item {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
}

.mosfet-calculator .result-label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.mosfet-calculator .result-value {
  font-size: 1.1rem;
  color: var(--accent-primary);
}
````

## File: src/components/tools/OhmsLawCalculator/Description.tsx
````typescript
'use client';

import React from 'react';
import { OhmsLawResults } from './index'; // Assuming OhmsLawResults is defined in index.tsx
// Import only the necessary utility
import { formatValueWithSuffix } from '../../../lib/utils/inputUtils';

interface DescriptionProps {
  results: OhmsLawResults;
}

const Description: React.FC<DescriptionProps> = ({ results }) => {
  // If no calculation has been performed yet, show placeholder or initial message
  if (!results.calculatedProperty) {
    return (
      <div className="ohms-law-description p-6 bg-black/30 border border-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Results</h3>
        <p className="text-gray-300 font-mono">
          {results.description || "Enter values for two parameters and click 'Calculate' to see results."}
        </p>
      </div>
    );
  }

  // --- Consistent Value Formatting ---
  // Parse the string results back to numbers for reliable formatting
  // Add fallback ('NaN') in case results somehow contain invalid strings
  const voltageNumeric = parseFloat(results.voltage || 'NaN');
  const currentNumeric = parseFloat(results.current || 'NaN');
  const resistanceNumeric = parseFloat(results.resistance || 'NaN');
  const powerNumeric = parseFloat(results.power || 'NaN');

  // Format Voltage, Resistance, Power using the utility
  const voltageDisplay = isNaN(voltageNumeric) ? 'Invalid' : formatValueWithSuffix(voltageNumeric, 'V');
  const resistanceDisplay = isNaN(resistanceNumeric) ? 'Invalid' : formatValueWithSuffix(resistanceNumeric, 'Ω');
  const powerDisplay = isNaN(powerNumeric) ? 'Invalid' : formatValueWithSuffix(powerNumeric, 'W');

  // Format Current based on the displayCurrentInMilliamps flag
  let currentDisplay: string;
  if (isNaN(currentNumeric)) {
      currentDisplay = 'Invalid'; // Handle potential NaN result
  } else if (results.displayCurrentInMilliamps) {
      // Format as mA
      currentDisplay = `${(currentNumeric * 1000).toFixed(3)}mA`;
  } else {
      // Format as A using the utility function
      currentDisplay = formatValueWithSuffix(currentNumeric, 'A');
  }
  // --- End of Consistent Value Formatting ---

  // Helper function to determine if a value was calculated
  const isCalculated = (property: string) => results.calculatedProperty === property;

  // Helper function to render a value with appropriate styling
  const renderValue = (label: string, value: string, property: string) => {
    const calculated = isCalculated(property);
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className={`
          font-mono text-lg p-2 rounded-md flex items-center
          ${calculated
            ? 'bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d]'
            : 'bg-black/20 border border-gray-800 text-gray-300'}
        `}>
          {/* Render the correctly formatted display value */}
          {value}
          {calculated && (
            <span className="ml-2 text-xs bg-[#00ff9d]/20 px-2 py-1 rounded-sm">
              CALCULATED
            </span>
          )}
        </div>
      </div>
    );
  };

  // Main component structure
  return (
    <div className="ohms-law-description p-6 bg-black/30 border border-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Results</h3>

      {/* Grid for displaying the values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderValue("Voltage", voltageDisplay, "voltage")}
        {renderValue("Current", currentDisplay, "current")}
        {renderValue("Resistance", resistanceDisplay, "resistance")}
        {renderValue("Power", powerDisplay, "power")}
      </div>

      {/* Section for calculation details and formulas */}
      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2 text-[#00ff9d]">Calculation Details</h4>
        <div className="bg-black/40 border border-gray-800 rounded-md p-4 font-mono text-sm text-gray-300">
          {/* Display the description from the results */}
          <p>{results.description}</p>

          {/* Ohm's Law Formulas Section */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h5 className="text-sm font-bold mb-2 text-[#00ff9d]">Ohm&apos;s Law Formulas Used</h5>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li className={results.calculatedProperty === 'voltage' ? 'text-[#00ff9d]' : ''}>
                Voltage (V) = Current (I) × Resistance (R)  |  V = P / I  |  V = √(P × R)
              </li>
              <li className={results.calculatedProperty === 'current' ? 'text-[#00ff9d]' : ''}>
                Current (I) = Voltage (V) ÷ Resistance (R)  |  I = P / V  |  I = √(P / R)
              </li>
              <li className={results.calculatedProperty === 'resistance' ? 'text-[#00ff9d]' : ''}>
                Resistance (R) = Voltage (V) ÷ Current (I)  |  R = V² / P  |  R = P / I²
              </li>
              <li className={results.calculatedProperty === 'power' ? 'text-[#00ff9d]' : ''}>
                Power (P) = Voltage (V) × Current (I)  |  P = V² / R  |  P = I² × R
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Description;
````

## File: src/components/tools/OhmsLawCalculator/index.tsx
````typescript
'use client';

import React, { useState, useCallback } from 'react';
import OhmsLawDiagram from './OhmsLawDiagram';
import OhmsLawForm from './OhmsLawForm';
import Description from './Description';
import { calculateOhmsLaw } from './ohmsLawUtils';
import './styles.css';

export interface OhmsLawValues {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
}

export interface OhmsLawResults {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
  description: string;
  displayCurrentInMilliamps?: boolean;
}

export default function OhmsLawCalculator() {
  const [values, setValues] = useState<OhmsLawValues>({
    voltage: '',
    current: '',
    resistance: '',
    power: ''
  });
  
  const [results, setResults] = useState<OhmsLawResults>({
    voltage: '',
    current: '',
    resistance: '',
    power: '',
    calculatedProperty: null,
    description: '',
    displayCurrentInMilliamps: undefined
  });

  const handleValueChange = useCallback((name: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCalculate = useCallback((calculationMode: 'voltage' | 'current' | 'resistance' | 'power') => {
    const result = calculateOhmsLaw(values, calculationMode);
    setResults(result);
  }, [values]);

  const handleClear = useCallback(() => {
    setValues({
      voltage: '',
      current: '',
      resistance: '',
      power: ''
    });
    
    setResults({
      voltage: '',
      current: '',
      resistance: '',
      power: '',
      calculatedProperty: null,
      description: '',
      displayCurrentInMilliamps: undefined
    });
  }, []);

  return (
    <div className="ohms-law-calculator">
      <div className="max-w-screen-xl mx-auto">
        <div className="ohms-law-container">
          <div className="ohms-law-left-section">
            <h2 className="text-xl font-bold mb-4">Ohm&apos;s Law Calculator</h2>
            <OhmsLawDiagram values={values} calculatedProperty={results.calculatedProperty} />
          </div>
          <div className="ohms-law-right-section">
            <OhmsLawForm 
              values={values}
              onValueChange={handleValueChange}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          </div>
        </div>
        {results.calculatedProperty && (
          <Description results={results} />
        )}
      </div>
    </div>
  );
}
````

## File: src/components/tools/OhmsLawCalculator/OhmsLawDiagram.tsx
````typescript
'use client';

import React from 'react';
import { OhmsLawValues } from './index';
import { parseFieldValue, formatValueWithSuffix } from '../../../lib/utils/inputUtils';

interface OhmsLawDiagramProps {
  values: OhmsLawValues;
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
}

/**
 * Format a value for display in the diagram with appropriate units
 * 
 * @param value The value to format
 * @param fieldType The type of field (voltage, current, resistance, power)
 * @returns Formatted value with appropriate unit
 */
const formatDisplayValue = (value: string, fieldType: 'voltage' | 'current' | 'resistance' | 'power'): string => {
  if (!value || value.trim() === '') return '';
  
  const numericValue = parseFieldValue(value, fieldType);
  
  // Special handling for current to display mA when appropriate
  if (fieldType === 'current') {
    // Check if the original input was in milliamps format
    const isInputInMilliamps = value && 
      (value.toLowerCase().includes('ma') || 
       (value.toLowerCase().includes('m') && !value.toLowerCase().includes('ma')));
    
    // Display in mA if value is small or explicitly entered with mA suffix
    if (numericValue < 0.1 || isInputInMilliamps) {
      // If it's an explicit milliamp input, preserve the original format
      if (isInputInMilliamps) {
        // Extract the numeric part from the original input
        const match = value.match(/^(\d*\.?\d*)/);
        if (match && match[1]) {
          return `${match[1]}mA`;
        }
      }
      // Otherwise format consistently
      return `${(numericValue * 1000).toFixed(3)}mA`;
    }
    return formatValueWithSuffix(numericValue, 'A');
  }
  
  // Handle other field types
  switch (fieldType) {
    case 'voltage':
      return formatValueWithSuffix(numericValue, 'V');
    case 'resistance':
      return formatValueWithSuffix(numericValue, 'Ω');
    case 'power':
      return formatValueWithSuffix(numericValue, 'W');
    default:
      return value;
  }
};

const OhmsLawDiagram: React.FC<OhmsLawDiagramProps> = ({ values, calculatedProperty }) => {
  // Determine which values to highlight based on what was calculated
  const getHighlightColor = (property: 'voltage' | 'current' | 'resistance' | 'power') => {
    return calculatedProperty === property 
      ? '#00ff9d' // Highlight calculated property
      : '#ffffff'; // Normal color for other properties
  };

  // Format display values with appropriate units
  const voltageDisplay = formatDisplayValue(values.voltage, 'voltage');
  const currentDisplay = formatDisplayValue(values.current, 'current');
  const resistanceDisplay = formatDisplayValue(values.resistance, 'resistance');
  const powerDisplay = formatDisplayValue(values.power, 'power');

  return (
    <div className="ohms-law-diagram">
      <div className="bg-black/30 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="text-sm text-[#00ff9d] font-mono mb-4">OHM&apos;S LAW DIAGRAM</div>
        
        <div className="w-full max-w-md mx-auto">
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            {/* Circle */}
            <circle 
              cx="200" 
              cy="200" 
              r="150" 
              fill="none" 
              stroke="#333" 
              strokeWidth="1" 
            />
            
            {/* Horizontal and Vertical Lines */}
            <line 
              x1="50" y1="200" x2="350" y2="200" 
              stroke="#333" 
              strokeWidth="1" 
            />
            <line 
              x1="200" y1="50" x2="200" y2="350" 
              stroke="#333" 
              strokeWidth="1" 
            />
            
            {/* Voltage (Top) */}
            <g>
              <circle cx="200" cy="80" r="30" fill="#111" stroke="#444" />
              <text x="200" y="85" textAnchor="middle" fill="#888" fontSize="14">V</text>
              {values.voltage && (
                <text 
                  x="200" 
                  y="130" 
                  textAnchor="middle" 
                  fill={getHighlightColor('voltage')} 
                  className="text-sm font-mono"
                >
                  {voltageDisplay}
                </text>
              )}
            </g>
            
            {/* Current (Left) */}
            <g>
              <circle cx="80" cy="200" r="30" fill="#111" stroke="#444" />
              <text x="80" y="205" textAnchor="middle" fill="#888" fontSize="14">I</text>
              {values.current && (
                <text 
                  x="80" 
                  y="250" 
                  textAnchor="middle" 
                  fill={getHighlightColor('current')} 
                  className="text-sm font-mono"
                >
                  {currentDisplay}
                </text>
              )}
            </g>
            
            {/* Resistance (Right) */}
            <g>
              <circle cx="320" cy="200" r="30" fill="#111" stroke="#444" />
              <text x="320" y="205" textAnchor="middle" fill="#888" fontSize="14">R</text>
              {values.resistance && (
                <text 
                  x="320" 
                  y="250" 
                  textAnchor="middle" 
                  fill={getHighlightColor('resistance')} 
                  className="text-sm font-mono"
                >
                  {resistanceDisplay}
                </text>
              )}
            </g>
            
            {/* Power (Bottom) */}
            <g>
              <circle cx="200" cy="320" r="30" fill="#111" stroke="#444" />
              <text x="200" y="325" textAnchor="middle" fill="#888" fontSize="14">P</text>
              {values.power && (
                <text 
                  x="200" 
                  y="370" 
                  textAnchor="middle" 
                  fill={getHighlightColor('power')} 
                  className="text-sm font-mono"
                >
                  {powerDisplay}
                </text>
              )}
            </g>
            
            {/* Formulas */}
            <g>
              <rect x="150" y="170" width="100" height="60" fill="#111" stroke="#333" />
              <text x="200" y="190" textAnchor="middle" fill="#00ff9d" fontSize="10">V = I × R</text>
              <text x="200" y="205" textAnchor="middle" fill="#00ff9d" fontSize="10">I = V ÷ R</text>
              <text x="200" y="220" textAnchor="middle" fill="#00ff9d" fontSize="10">P = V × I</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawDiagram;
````

## File: src/components/tools/OhmsLawCalculator/OhmsLawForm.tsx
````typescript
'use client';

import React, { useState } from 'react';
import Tooltip from '../../../lib/utils/Tooltip'; // Assuming Tooltip component exists
import {
  // Import necessary functions from the corrected inputUtils
  isValidNumberInput,
  isValidVoltage,     // Use if specific validation needed beyond basic number
  isValidResistance,  // Use if specific validation needed beyond basic number
  parseValueWithSuffix, // Use for parsing before warning checks
  getParameterWarning,
  getParameterTooltip,
  // FieldType // Removed as validateFieldInput/parseFieldValue are removed
} from '../../../lib/utils/inputUtils';
import { OhmsLawValues } from './index'; // Assuming OhmsLawValues is defined here

interface OhmsLawFormProps {
  values: OhmsLawValues;
  onValueChange: (name: string, value: string) => void;
  onCalculate: (calculationMode: 'voltage' | 'current' | 'resistance' | 'power') => void;
  onClear: () => void;
}

// Warning ranges for each parameter (Assuming these are defined elsewhere or ok as is)
// const warningRanges = { ... }; // Keep if needed, not shown here for brevity

const OhmsLawForm: React.FC<OhmsLawFormProps> = ({
  values,
  onValueChange,
  onCalculate,
  onClear
}) => {
  const [calculationMode, setCalculationMode] = useState<'voltage' | 'current' | 'resistance' | 'power'>('voltage');
  const [warnings, setWarnings] = useState<{[key: string]: string}>({
    voltage: '',
    current: '',
    resistance: '',
    power: ''
  });

  // Count how many fields have values
  const filledFieldsCount = Object.values(values).filter(value => value.trim() !== '').length;

  // Determine which fields have values (excluding the calculation mode)
  const filledFields = Object.entries(values)
    .filter(([key, value]) => key !== calculationMode && value.trim() !== '')
    .map(([key]) => key);

  // Determine if a field should be disabled
  const shouldDisableField = (fieldName: string) => {
    if (fieldName === calculationMode) return false; // Never disable the calculated field
    return filledFieldsCount >= 2 && !filledFields.includes(fieldName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldType = name as keyof OhmsLawValues; // Get field type from name

    // --- Basic Input Filtering (Optional but good UX) ---
    let allowUpdate = false;
    if (value === '') {
        allowUpdate = true; // Always allow clearing
    } else if (fieldType === 'voltage') {
        allowUpdate = isValidVoltage(value);
    } else if (fieldType === 'resistance') {
        allowUpdate = isValidResistance(value);
    } else { // For current, power, or others
        allowUpdate = isValidNumberInput(value); // Use the general validator
    }
    // --- End Basic Input Filtering ---


    if (allowUpdate) {
      onValueChange(name, value); // Update parent state

      // Check for warnings only if the field has a potentially valid value
      if (value.trim() !== '') {
          // Use parseValueWithSuffix to get a number for the warning check
          const parsedValue = parseValueWithSuffix(value);
          // Pass the field name directly to getParameterWarning
          const warning = getParameterWarning(fieldType, parsedValue); // Pass parsed number
          setWarnings(prev => ({
            ...prev,
            [name]: warning || '' // Ensure empty string if no warning
          }));
      } else {
        // Clear warning if field is empty
        setWarnings(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
    // If !allowUpdate, the input change is ignored, preventing invalid characters
    // (Adjust this behavior if you prefer looser input filtering)
  };

  // Removed formatCurrentDisplay function - Input displays raw value

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast the value to the specific literal type union
    setCalculationMode(e.target.value as 'voltage' | 'current' | 'resistance' | 'power');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if exactly two fields are filled before calculating
    if (filledFieldsCount === 2) {
        onCalculate(calculationMode);
    } else {
        // Optionally provide feedback if not exactly 2 fields are filled
        console.warn("Calculation requires exactly 2 input values.");
        // You could update a status message here instead of console logging
    }
  };

  // Tooltip function remains the same
  const getTooltip = (name: string) => {
    return getParameterTooltip(name);
  };
  const getDisabledTooltip = (fieldName: string) => {
    if (shouldDisableField(fieldName)) {
      return "Enter exactly 2 values to calculate the others. Clear a field to edit this one.";
    }
    return getTooltip(fieldName);
  };

  // --- JSX Structure ---
  return (
    <form onSubmit={handleSubmit} className="ohms-law-form">
      {/* Calculation Mode Selector */}
      <div className="mb-6">
        <label htmlFor="calculationModeSelect" className="block text-sm font-medium mb-2">Calculate</label>
        <select
          id="calculationModeSelect" // Added id for label association
          className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
          value={calculationMode}
          onChange={handleModeChange}
        >
          <option value="voltage">Voltage (V)</option>
          <option value="current">Current (I)</option>
          <option value="resistance">Resistance (R)</option>
          <option value="power">Power (P)</option>
        </select>
      </div>

      {/* Instructions Box */}
      <div className="bg-black/40 border border-gray-800 rounded-md p-4 mb-6">
         <p className="text-sm text-[#00ff9d] font-mono mb-2">INSTRUCTIONS</p>
         <p className="text-sm text-gray-300">
           Select the value to calculate, then enter values for <strong>exactly 2</strong> of the other parameters.
         </p>
         <div className="mt-2 text-xs text-gray-400 space-y-1">
           <p>• Examples:</p>
           <ul className="ml-4 list-disc">
             <li>Voltage: <span className="text-yellow-400">5</span> (5V)</li>
             <li>Current: <span className="text-yellow-400">5</span> (5A), <span className="text-yellow-400">5m</span> or <span className="text-yellow-400">5mA</span> (5mA), <span className="text-yellow-400">10u</span> (10µA)</li>
             <li>Resistance: <span className="text-yellow-400">5</span> (5Ω), <span className="text-yellow-400">1k</span> (1kΩ), <span className="text-yellow-400">2M</span> (2MΩ)</li>
             <li>Power: <span className="text-yellow-400">5</span> (5W), <span className="text-yellow-400">10m</span> (10mW)</li>
            </ul>
            <p>• Suffixes k, M, G, m, u/µ are supported.</p>
         </div>
         <p className="text-xs text-gray-400 mt-2">
           {filledFieldsCount < 2 ? (
             `Enter ${2 - filledFieldsCount} more value(s).`
           ) : filledFieldsCount > 2 ? (
             <span className="text-red-500">Clear a value. Only 2 inputs needed.</span>
           ) : (
            <span className="text-green-500">Ready to Calculate!</span>
           )}
         </p>
       </div>


      {/* Input Fields */}
      <div className="space-y-4">
        {/* Voltage Input */}
        {calculationMode !== 'voltage' && (
          <div>
            <label htmlFor="voltageInput" className="block text-sm font-medium mb-2">Voltage (V)</label>
            <Tooltip text={getDisabledTooltip('voltage')} position="top">
              <input
                id="voltageInput" // Added id
                type="text" // Use "text" for flexible input, validation handles format
                inputMode="decimal" // Hint for mobile keyboards
                name="voltage"
                className={`w-full bg-black/30 border ${shouldDisableField('voltage') ? 'border-red-800 bg-red-900/20 cursor-not-allowed text-gray-500' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.voltage} // Display raw value from state
                onChange={handleInputChange}
                placeholder="Enter voltage"
                disabled={shouldDisableField('voltage')}
              />
            </Tooltip>
            {warnings.voltage && <div className="text-yellow-400 text-sm mt-1">{warnings.voltage}</div>}
          </div>
        )}

        {/* Current Input */}
        {calculationMode !== 'current' && (
          <div>
            <label htmlFor="currentInput" className="block text-sm font-medium mb-2">Current (I)</label>
            <Tooltip text={getDisabledTooltip('current')} position="top">
              <input
                id="currentInput" // Added id
                type="text"
                inputMode="decimal"
                name="current"
                className={`w-full bg-black/30 border ${shouldDisableField('current') ? 'border-red-800 bg-red-900/20 cursor-not-allowed text-gray-500' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.current} // Display raw value from state
                onChange={handleInputChange}
                placeholder="e.g., 5 (5A), 5m or 5mA (5mA)"
                disabled={shouldDisableField('current')}
              />
            </Tooltip>
            {warnings.current && <div className="text-yellow-400 text-sm mt-1">{warnings.current}</div>}
          </div>
        )}

        {/* Resistance Input */}
        {calculationMode !== 'resistance' && (
          <div>
            <label htmlFor="resistanceInput" className="block text-sm font-medium mb-2">Resistance (R)</label>
            <Tooltip text={getDisabledTooltip('resistance')} position="top">
              <input
                id="resistanceInput" // Added id
                type="text"
                inputMode="decimal"
                name="resistance"
                className={`w-full bg-black/30 border ${shouldDisableField('resistance') ? 'border-red-800 bg-red-900/20 cursor-not-allowed text-gray-500' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.resistance} // Display raw value from state
                onChange={handleInputChange}
                placeholder="e.g., 5 (5Ω), 1k (1kΩ)"
                disabled={shouldDisableField('resistance')}
              />
            </Tooltip>
            {warnings.resistance && <div className="text-yellow-400 text-sm mt-1">{warnings.resistance}</div>}
          </div>
        )}

        {/* Power Input */}
        {calculationMode !== 'power' && (
          <div>
            <label htmlFor="powerInput" className="block text-sm font-medium mb-2">Power (P)</label>
            <Tooltip text={getDisabledTooltip('power')} position="top">
              <input
                id="powerInput" // Added id
                type="text"
                inputMode="decimal"
                name="power"
                className={`w-full bg-black/30 border ${shouldDisableField('power') ? 'border-red-800 bg-red-900/20 cursor-not-allowed text-gray-500' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.power} // Display raw value from state
                onChange={handleInputChange}
                placeholder="e.g., 5 (5W), 10m (10mW)"
                disabled={shouldDisableField('power')}
              />
            </Tooltip>
            {warnings.power && <div className="text-yellow-400 text-sm mt-1">{warnings.power}</div>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4 mb-8">
        <button
          type="submit"
          className={`flex-1 font-mono py-2 px-4 rounded-md transition-all duration-300 ${
            filledFieldsCount === 2
              ? 'bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 border border-[#00ff9d]/50 text-[#00ff9d]'
              : 'bg-gray-700/50 border border-gray-600 text-gray-500 cursor-not-allowed'
          }`}
          disabled={filledFieldsCount !== 2} // Disable if not exactly 2 fields are filled
        >
          Calculate {calculationMode.charAt(0).toUpperCase() + calculationMode.slice(1)}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 text-gray-300 font-mono py-2 px-4 rounded-md transition-all duration-300"
        >
          Clear All
        </button>
      </div>
    </form>
  );
};

export default OhmsLawForm;
````

## File: src/components/tools/OhmsLawCalculator/ohmsLawUtils.ts
````typescript
'use client';

import { OhmsLawValues, OhmsLawResults } from './index'; // Assuming index.tsx defines these types
import {
  parseValueWithSuffix,     // Use the corrected, robust parser
  formatValueWithSuffix     // Used for formatting within descriptions
  // parseFieldValue // Removed - use parseValueWithSuffix directly
} from '../../../lib/utils/inputUtils';

/**
 * Calculate the missing value in Ohm's Law based on the provided values
 *
 * @param values The input values for voltage, current, resistance, and power (as strings)
 * @param calculationMode Which property to calculate
 * @returns The calculated results including all values (as strings) and a description
 */
export function calculateOhmsLaw(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): OhmsLawResults {
  // 1. Parse ALL input values robustly using the utility function
  // parseValueWithSuffix returns 0 for invalid/empty, which works for checks below
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current); // Will handle '5', '5m', '5mA' correctly -> Amps
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);

  // 2. Determine if the original input suggested mA display preference
  const isCurrentInputSuggestingMilliamps = values.current &&
    (values.current.toLowerCase().includes('ma') ||
     (values.current.toLowerCase().includes('m') && !/^[0-9.]*M$/i.test(values.current.trim()))); // 'm' suffix, but not MegaOhms etc.


  // 3. Initialize results object - store results as strings for consistency with input state
  const results: OhmsLawResults = {
    voltage: '', // Will be populated below
    current: '', // Will be populated below
    resistance: '', // Will be populated below
    power: '', // Will be populated below
    calculatedProperty: calculationMode,
    description: '',
    // Set the flag based on original input OR if calculated value is small
    // Note: We check the *parsed* current value here for smallness check
    displayCurrentInMilliamps: isCurrentInputSuggestingMilliamps || (current > 0 && current < 0.1)
  };

  // --- Store initially parsed values (even if not calculated yet) ---
  // This ensures that if a value was provided but not calculated, it's still in the results
  if (calculationMode !== 'voltage' && voltage > 0) results.voltage = voltage.toString();
  if (calculationMode !== 'current' && current > 0) results.current = current.toString();
  if (calculationMode !== 'resistance' && resistance > 0) results.resistance = resistance.toString();
  if (calculationMode !== 'power' && power > 0) results.power = power.toString();
  // ---

  // 4. Perform calculations based on mode
  let calculatedVoltage: number | null = null;
  let calculatedCurrent: number | null = null;
  let calculatedResistance: number | null = null;
  let calculatedPower: number | null = null;
  let sufficientData = false;

  // Helper to format numbers for description (using base units mostly)
  const formatForDesc = (val: number, unit: string) => formatValueWithSuffix(val, unit);

  switch (calculationMode) {
    case 'voltage':
      if (current > 0 && resistance > 0) {
        calculatedVoltage = current * resistance;
        calculatedPower = calculatedVoltage * current; // Calculate power too
        results.description = `V = I × R = ${formatForDesc(current, 'A')} × ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedVoltage, 'V')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (power > 0 && resistance > 0) {
        calculatedVoltage = Math.sqrt(power * resistance);
        calculatedCurrent = calculatedVoltage / resistance; // Calculate current too
        results.description = `V = √(P × R) = √(${formatForDesc(power, 'W')} × ${formatForDesc(resistance, 'Ω')}) = ${formatForDesc(calculatedVoltage, 'V')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (power > 0 && current > 0) {
        calculatedVoltage = power / current;
        calculatedResistance = calculatedVoltage / current; // Calculate resistance too
        results.description = `V = P / I = ${formatForDesc(power, 'W')} / ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedVoltage, 'V')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      }
      break; // End voltage case

    case 'current':
      if (voltage > 0 && resistance > 0) {
        calculatedCurrent = voltage / resistance;
        calculatedPower = voltage * calculatedCurrent;
        results.description = `I = V / R = ${formatForDesc(voltage, 'V')} / ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedCurrent, 'A')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (power > 0 && resistance > 0) {
        calculatedCurrent = Math.sqrt(power / resistance);
        calculatedVoltage = calculatedCurrent * resistance;
        results.description = `I = √(P / R) = √(${formatForDesc(power, 'W')} / ${formatForDesc(resistance, 'Ω')}) = ${formatForDesc(calculatedCurrent, 'A')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      } else if (power > 0 && voltage > 0) {
        calculatedCurrent = power / voltage;
        calculatedResistance = voltage / calculatedCurrent;
        results.description = `I = P / V = ${formatForDesc(power, 'W')} / ${formatForDesc(voltage, 'V')} = ${formatForDesc(calculatedCurrent, 'A')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      }
       // Update mA display flag based on *calculated* current if it wasn't set by input
       if(calculatedCurrent !== null && !isCurrentInputSuggestingMilliamps) {
            results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
       }
      break; // End current case

    case 'resistance':
      if (voltage > 0 && current > 0) {
        calculatedResistance = voltage / current;
        calculatedPower = voltage * current;
        results.description = `R = V / I = ${formatForDesc(voltage, 'V')} / ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedResistance, 'Ω')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (voltage > 0 && power > 0) {
        calculatedResistance = (voltage * voltage) / power;
        calculatedCurrent = voltage / calculatedResistance;
        results.description = `R = V² / P = ${formatForDesc(voltage, 'V')}² / ${formatForDesc(power, 'W')} = ${formatForDesc(calculatedResistance, 'Ω')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (power > 0 && current > 0) {
        calculatedResistance = power / (current * current);
        calculatedVoltage = current * calculatedResistance;
        results.description = `R = P / I² = ${formatForDesc(power, 'W')} / ${formatForDesc(current, 'A')}² = ${formatForDesc(calculatedResistance, 'Ω')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      }
      // Update mA display flag based on *calculated* current if it wasn't set by input
      if (calculatedCurrent !== null && !isCurrentInputSuggestingMilliamps) {
        results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
      }
      break; // End resistance case

    case 'power':
      if (voltage > 0 && current > 0) {
        calculatedPower = voltage * current;
        calculatedResistance = voltage / current;
        results.description = `P = V × I = ${formatForDesc(voltage, 'V')} × ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedPower, 'W')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      } else if (voltage > 0 && resistance > 0) {
        calculatedPower = (voltage * voltage) / resistance;
        calculatedCurrent = voltage / resistance;
        results.description = `P = V² / R = ${formatForDesc(voltage, 'V')}² / ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedPower, 'W')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (current > 0 && resistance > 0) {
        calculatedPower = current * current * resistance;
        calculatedVoltage = current * resistance;
        results.description = `P = I² × R = ${formatForDesc(current, 'A')}² × ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedPower, 'W')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      }
      break; // End power case
  }

  // 5. Update results object and handle insufficient data
  if (sufficientData) {
    // Populate the results object with calculated values (as strings)
    if (calculatedVoltage !== null) results.voltage = calculatedVoltage.toString();
    if (calculatedCurrent !== null) results.current = calculatedCurrent.toString();
    if (calculatedResistance !== null) results.resistance = calculatedResistance.toString();
    if (calculatedPower !== null) results.power = calculatedPower.toString();

     // Ensure the display flag is correct if current was recalculated
     if (calculatedCurrent !== null && calculationMode !== 'current' && !isCurrentInputSuggestingMilliamps) {
          results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
     }

  } else {
    // Not enough data provided for the selected calculation mode
    results.calculatedProperty = null; // Reset calculated property flag
    // Clear potentially partially filled calculated values
    results.voltage = calculationMode === 'voltage' ? '' : results.voltage;
    results.current = calculationMode === 'current' ? '' : results.current;
    results.resistance = calculationMode === 'resistance' ? '' : results.resistance;
    results.power = calculationMode === 'power' ? '' : results.power;

    // Provide a generic error message (could be more specific based on mode)
    results.description = `Insufficient data to calculate ${calculationMode}. Please provide the required two values.`;
  }

  return results;
}


/**
 * Validates if the provided values are sufficient to perform the calculation.
 * NOTE: This might be redundant if the main calculate function handles insufficient data gracefully.
 *
 * @param values The input values (as strings)
 * @param calculationMode Which property to calculate
 * @returns True if the values are sufficient for calculation
 */
export function validateInputs(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): boolean {
  // Parse input values using the robust parser
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current);
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);

  // let count = 0;
  // if (voltage > 0) count++;
  // if (current > 0) count++;
  // if (resistance > 0) count++;
  // if (power > 0) count++;

  // Need exactly 2 values provided (excluding the one being calculated)
  // Or just check if enough data exists for the specific calculation
  let requiredInputsMet = false;
   switch (calculationMode) {
    case 'voltage':
      requiredInputsMet = (current > 0 && resistance > 0) || (power > 0 && resistance > 0) || (power > 0 && current > 0);
      break;
    case 'current':
      requiredInputsMet = (voltage > 0 && resistance > 0) || (power > 0 && resistance > 0) || (power > 0 && voltage > 0);
      break;
    case 'resistance':
       requiredInputsMet = (voltage > 0 && current > 0) || (voltage > 0 && power > 0) || (power > 0 && current > 0);
       break;
    case 'power':
       requiredInputsMet = (voltage > 0 && current > 0) || (voltage > 0 && resistance > 0) || (current > 0 && resistance > 0);
       break;
  }

  // Also ensure that not *too many* inputs were provided, as calculateOhmsLaw uses specific pairs.
  // Count how many of the *needed* inputs for the non-calculated fields exist.
  // let providedInputCount = 0;
  // if (calculationMode !== 'voltage' && voltage > 0) providedInputCount++;
  // if (calculationMode !== 'current' && current > 0) providedInputCount++;
  // if (calculationMode !== 'resistance' && resistance > 0) providedInputCount++;
  // if (calculationMode !== 'power' && power > 0) providedInputCount++;


  // The core logic now checks specific pairs, so just ensure at least 2 inputs are provided overall.
  // The main function handles the specific pair requirements.
  // return providedInputCount >= 2; // Or perhaps exactly 2?
   return requiredInputsMet; // The check inside calculateOhmsLaw is sufficient.
}
````

## File: src/components/tools/OhmsLawCalculator/styles.css
````css
/* Ohm's Law Calculator Styles */

.ohms-law-calculator {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
}

.ohms-law-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .ohms-law-container {
    grid-template-columns: 1fr 1fr;
  }
}

.ohms-law-left-section {
  display: flex;
  flex-direction: column;
}

.ohms-law-right-section {
  display: flex;
  flex-direction: column;
}

.ohms-law-diagram {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ohms-law-form input,
.ohms-law-form select {
  background-color: rgba(10, 10, 10, 0.3);
  border: 1px solid #333;
  color: #ededed;
  transition: all 0.2s ease;
}

/* Fix dropdown background color */
.ohms-law-form select {
  background-color: var(--accent-purple);
  color: #18102b;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2rem;
}

/* Fix dropdown options */
.ohms-law-form select option {
  background-color: #18102b;
  color: #ededed;
}

.ohms-law-form input:focus,
.ohms-law-form select:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 2px var(--accent-purple);
  outline: none;
}

.ohms-law-form input:disabled,
.ohms-law-form select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ohms-law-form button {
  transition: all 0.2s ease;
}

.ohms-law-form button:hover {
  transform: translateY(-1px);
}

.ohms-law-form button:active {
  transform: translateY(0);
}

.ohms-law-results {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ohms-law-results h3 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.ohms-law-result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .ohms-law-result-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.ohms-law-result-item {
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.ohms-law-result-item.calculated {
  border-color: var(--accent-primary);
  background-color: rgba(0, 255, 157, 0.05);
}

.ohms-law-description {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.ohms-law-formulas {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow effect for calculated values */
.bg-accent {
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
}

/* Pulse animation for calculated values */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 157, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 157, 0);
  }
}

.highlight-pulse {
  animation: pulse 2s infinite;
}

/* Grid pattern background for the diagram */
.ohms-law-diagram .relative {
  background-image: 
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0;
}
````

## File: src/components/TooltipText/index.ts
````typescript
import TooltipText from './TooltipText';

export default TooltipText;
````

## File: src/components/TooltipText/TooltipText.module.css
````css
.tooltipContainer {
  position: relative;
  display: inline-block;
  margin: 1rem 0;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}

.content {
  padding: 0.5rem;
  background-color: #0a0d11;
  border: 1px solid #333;
  border-radius: 4px;
  overflow-x: auto;
}

.tooltipTarget {
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tooltipTarget:hover {
  text-shadow: 0 0 8px currentColor;
}

.tooltip {
  position: absolute;
  z-index: 10;
  background-color: #111;
  color: #fff;
  border: 1px solid #00ff9d;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  max-width: 300px;
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  pointer-events: none;
  white-space: normal;
  width: auto;
  text-align: center;
}

/* Tooltip positions */
.tooltip.top {
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.bottom {
  top: 125%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.left {
  right: 125%;
  top: 50%;
  transform: translateY(-50%);
}

.tooltip.right {
  left: 125%;
  top: 50%;
  transform: translateY(-50%);
}

/* Tooltip arrows */
.tooltip::after {
  content: '';
  position: absolute;
  border-style: solid;
  border-width: 6px;
}

.tooltip.top::after {
  bottom: -12px;
  left: 50%;
  margin-left: -6px;
  border-color: #00ff9d transparent transparent transparent;
}

.tooltip.bottom::after {
  top: -12px;
  left: 50%;
  margin-left: -6px;
  border-color: transparent transparent #00ff9d transparent;
}

.tooltip.left::after {
  right: -12px;
  top: 50%;
  margin-top: -6px;
  border-color: transparent transparent transparent #00ff9d;
}

.tooltip.right::after {
  left: -12px;
  top: 50%;
  margin-top: -6px;
  border-color: transparent #00ff9d transparent transparent;
}
````

## File: src/components/TooltipText/TooltipText.tsx
````typescript
"use client";

import React, { useState } from 'react';
import styles from './TooltipText.module.css';

export interface TooltipItem {
  text: string;       // The text to be highlighted
  tooltip: string;    // The tooltip content
  color?: string;     // Optional color for the highlighted text
}

interface TooltipTextProps {
  content: string;              // The full content string
  tooltips: TooltipItem[];      // Array of items to add tooltips to
  className?: string;           // Optional additional className
  position?: 'top' | 'bottom' | 'left' | 'right';  // Tooltip position
  mono?: boolean;               // Whether to use monospace font
}

const TooltipText: React.FC<TooltipTextProps> = ({
  content,
  tooltips,
  className,
  position = 'bottom',
  mono = true
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Process the content to replace tooltip targets with interactive spans
  const processContent = () => {
    let processedContent = content;
    
    tooltips.forEach((item) => {
      // Create a regex to match the exact text
      const regex = new RegExp(`(${item.text})`, 'g');
      
      // Replace with an interactive span
      processedContent = processedContent.replace(regex, `<span 
        class="${styles.tooltipTarget}" 
        style="color: ${item.color || '#00ff9d'}" 
        data-tooltip="${item.tooltip.replace(/"/g, '&quot;')}"
        data-text="${item.text.replace(/"/g, '&quot;')}"
      >$1</span>`);
    });
    
    return processedContent;
  };

  // Handle mouseover event
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains(styles.tooltipTarget)) {
      const tooltip = target.getAttribute('data-tooltip');
      setActiveTooltip(tooltip);
    } else {
      setActiveTooltip(null);
    }
  };

  return (
    <div className={`${styles.tooltipContainer} ${className || ''} ${mono ? styles.mono : ''}`}>
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: processContent() }}
        onMouseOver={handleMouseOver}
        onMouseOut={() => setActiveTooltip(null)}
      />
      
      {activeTooltip && (
        <div className={`${styles.tooltip} ${styles[position]}`}>
          {activeTooltip}
        </div>
      )}
    </div>
  );
};

export default TooltipText;
````

## File: src/components/BlogCard.tsx
````typescript
"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from 'next/navigation';

interface BlogCardProps {
  post: {
    slug: string;
    title?: string;
    coverImage?: string;
    tags?: string[];
    excerpt?: string;
    author?: string;
    date?: string;
  };
  formattedDate: string;
}

export default function BlogCard({ post, formattedDate }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="no-underline hover:no-underline text-decoration-none decoration-none group bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1 block focus:outline-none focus:ring-2 focus:ring-green-400"
      style={{ textDecoration: 'none' }}
      tabIndex={0}
      aria-label={post.title || 'Blog post'}
    >
      {post.coverImage ? (
        <div className="relative w-full h-56 md:h-64 overflow-hidden border-b border-gray-800">
          <Image
            src={post.coverImage}
            alt={post.title || "Blog post"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-56 md:h-64 bg-gray-900 flex items-center justify-center border-b border-gray-800">
          <span className="text-green-400 font-mono text-xl">&lt;/&gt;</span>
        </div>
      )}
      <div className="p-6">
        {/* Tags section */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <TagButton tag={tag} key={`${tag}-${index}`} />
            ))}
          </div>
        )}
        {/* Title section */}
        <h2 className="text-xl font-bold mb-3" style={{ textDecoration: 'none' }}>
          {post.title || "Untitled Post"}
        </h2>
        {/* Excerpt section */}
        {post.excerpt && (
          <p className="text-gray-400 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        {/* Author and date section */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span style={{ textDecoration: 'none' }}>{post.author || "Anonymous"}</span>
          <time dateTime={post.date || ""}>{formattedDate}</time>
        </div>
      </div>
    </Link>
  );
}

function TagButton({ tag }: { tag: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="no-underline hover:no-underline text-decoration-none decoration-none bg-gray-800 text-green-400 px-2 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
      style={{ textDecoration: 'none' }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/blog/tag/${tag}`);
      }}
      tabIndex={0}
      aria-label={`View posts tagged ${tag}`}
    >
      #{tag}
    </button>
  );
}
````

## File: src/components/BlogPost.tsx
````typescript
"use client";

import { useState, useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import Prism from 'prismjs';
import * as Tabs from '@radix-ui/react-tabs';
import RadixTabs from './RadixTabs';
import DropCap from './DropCap';
import CodeBlock from './CodeBlock';
import HDMIPinout from './HDMIPinout/HDMIPinout';
import InteractiveCodeBlock from './InteractiveCodeBlock';
import TooltipText from './TooltipText';
import I2CDetectOutput from './I2CDetectOutput';
import { useMDXComponents } from '../../mdx-components';

// Import Prism core styles
import 'prismjs/themes/prism-tomorrow.css';

// Import Prism language components and styles
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Custom components that can be used in MDX
const localComponents = {
  // Override default elements with custom styling
  h1: (props: ComponentProps) => (
    <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 text-white glow-text" {...props} />
  ),
  h2: (props: ComponentProps) => (
    <h2 className="text-2xl md:text-3xl font-bold font-mono mt-8 mb-4 text-green-400" {...props} />
  ),
  h3: (props: ComponentProps) => (
    <h3 className="text-xl md:text-2xl font-bold font-mono mt-6 mb-3" {...props} />
  ),
  p: (props: ComponentProps) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  a: (props: ComponentProps) => (
    <a className="text-green-400 hover:text-green-300 underline" {...props} />
  ),
  ul: (props: ComponentProps) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: ComponentProps) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: ComponentProps) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props: ComponentProps) => (
    <blockquote className="border-l-4 border-green-400 pl-4 my-4 italic bg-black/30 p-3" {...props} />
  ),
  code: (props: { children?: React.ReactNode; className?: string }) => {
    const { className, children, ...rest } = props;
    // If it's an inline code block (no language specified)
    if (!className) {
      return (
        <code className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm" {...rest}>
          {children}
        </code>
      );
    }
    
    // For code blocks with language specified by ```language
    const language = className.replace('language-', ''); // eslint-disable-line @typescript-eslint/no-unused-vars -- This specific variable is unused in this component's return
    return (
      <code className={`${className} block overflow-x-auto`} {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: ComponentProps & { children?: React.ReactElement<{ className?: string }> }) => {
    // Extract the language from the className of the code element
    const language = props.children?.props?.className
      ? props.children.props.className.replace('language-', '')
      : '';
      
    return (
      <pre className={`prism-code language-${language} bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm`}>
        {props.children}
      </pre>
    );
  },
  table: (props: ComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full bg-black/30 border border-gray-700 rounded-md" {...props} />
    </div>
  ),
  th: (props: ComponentProps) => (
    <th className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50" {...props} />
  ),
  td: (props: ComponentProps) => (
    <td className="border border-gray-700 px-4 py-2" {...props} />
  ),
  // Custom components
  Image, // This refers to the imported 'Image' from 'next/image'
  Link,  // This refers to the imported 'Link' from 'next/link'
  'Tabs.Root': Tabs.Root,
  'Tabs.List': Tabs.List,
  'Tabs.Trigger': Tabs.Trigger,
  'Tabs.Content': Tabs.Content,
  RadixTabs,
  DropCap,
  CodeBlock,
  HDMIPinout,
  InteractiveCodeBlock,
  TooltipText,
  I2CDetectOutput,
};

interface BlogPostProps {
  content: MDXRemoteSerializeResult;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    author: string;
    coverImage?: string;
  };
}

export default function BlogPost({ content, metadata }: BlogPostProps) {
  const [isClient, setIsClient] = useState(false);
  const formattedDate = format(new Date(metadata.date), 'MMMM d, yyyy');

  // Combine global MDX components with local ones
  const mdxComponents = useMDXComponents(localComponents);

  // Use useEffect to ensure the MDX content only renders on the client side
  // and to initialize Prism.js highlighting
  useEffect(() => {
    setIsClient(true);
    // Use setTimeout to ensure DOM has been populated with code blocks
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        Prism.highlightAll();
      }
    }, 0);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section outside of MDX content */}
      <div className="mb-6">
        {/* Cover image */}
        {metadata.coverImage && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={metadata.coverImage}
              alt={metadata.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {metadata.tags.map((tag: string) => (
            <Link 
              href={`/blog/tag/${tag}`} 
              key={tag}
              className="bg-gray-800 text-green-400 px-3 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        
        {/* Title and metadata */}
        <header className="mb-4">
          <h1 className="text-3xl md:text-5xl font-bold font-mono mb-4 text-white glow-text">
            {metadata.title}
          </h1>
          {metadata.excerpt && (
            <p className="text-green-300 text-xl font-mono mb-4">{metadata.excerpt}</p>
          )}
        </header>
      </div>
      
      {/* MDX Content */}
      <div className="prose prose-invert prose-green max-w-none bg-black/20 p-6 md:p-8 rounded-lg border border-gray-800/50 shadow-lg">
        {isClient ? (
          <MDXRemote {...content} components={mdxComponents} />
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          </div>
        )}
      </div>
      {/* Byline below content */}
      <div className="flex items-center justify-end text-gray-500 text-xs mt-4 font-mono">
        <span>{metadata.author}</span>
        <span className="mx-2">•</span>
        <time dateTime={metadata.date}>{formattedDate}</time>
      </div>
    </article>
  );
}
````

## File: src/components/ClientQuakeTerminalWrapper.tsx
````typescript
"use client"

import dynamic from 'next/dynamic'

// Use dynamic import for QuakeTerminal to prevent SSR issues
// The loading=null ensures no loading state is shown
const QuakeTerminal = dynamic(() => import('@/components/QuakeTerminal'), {
  ssr: false,
  loading: () => null
})

// This component ensures we only render the QuakeTerminal on the client
export default function ClientQuakeTerminalWrapper() {
  return <QuakeTerminal />
}
````

## File: src/components/CodeBlock.tsx
````typescript
import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, className }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className={`prism-code language-${language} bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm`}>
      <code ref={ref} className={`language-${language} ${className || ''}`.trim()}>
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;
````

## File: src/components/ContactForm.tsx
````typescript
'use client';

import { useState } from 'react';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string>('');
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong. Please try again.');
      }
      
      setStatus('success');
      // Reset form after successful submission
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2 font-mono text-green-400">
          NAME_
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formState.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 font-mono text-green-400">
          EMAIL_
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formState.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Subject field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2 font-mono text-green-400">
          SUBJECT_
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formState.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Message field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2 font-mono text-green-400">
          MESSAGE_
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          value={formState.message}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white resize-none"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Submission button and status */}
      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3 px-6 flex justify-center items-center bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-white font-medium rounded-md transition duration-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <>
              <span className="inline-block mr-2">SENDING</span>
              <span className="animate-pulse">...</span>
            </>
          ) : (
            'SUBMIT_'
          )}
        </button>
      </div>
      
      {/* Success message */}
      {status === 'success' && (
        <div className="p-4 border-l-4 border-green-500 bg-green-500/20 rounded-md">
          <p className="font-mono text-green-400">
            Message sent successfully! I&apos;ll get back to you soon.
          </p>
        </div>
      )}
      
      {/* Error message */}
      {status === 'error' && (
        <div className="p-4 border-l-4 border-red-500 bg-red-500/20 rounded-md">
          <p className="font-mono text-red-400">
            {error || 'An error occurred. Please try again later.'}
          </p>
        </div>
      )}
    </form>
  );
}
````

## File: src/components/DropCap.tsx
````typescript
import React from 'react';

/**
 * DropCap component for a hacker/cyber motif drop cap effect.
 * Wraps the first letter of its children in a styled div.
 * Usage: <DropCap>LoRa ...</DropCap>
 */
export default function DropCap({ children }: { children: React.ReactNode }) {
  return (
    <div className="dropcap-paragraph">{children}</div>
  );
}
````

## File: src/components/Footer.tsx
````typescript
"use client";

import Link from "next/link";
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">
              Battle<span className="text-white">With</span>Bytes
            </h3>
            <p className="text-sm font-mono">
              Ask me about little data.
              <br />
              A hub for cybersecurity, embedded hardware, and software engineering.
            </p>
          </div>
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <Link href="/blog" className="hover:text-green-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-green-400 transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-green-400 transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-green-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <a
                  href="https://github.com/ril3y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/ril3s.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="24" height="24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="BlueSky">
                    <circle cx="60" cy="60" r="60" fill="currentColor"/>
                    <path d="M60 92c-9.6-9.8-28-27.2-28-43.2C32 35.2 44.2 28 60 28s28 7.2 28 20.8C88 64.8 69.6 82.2 60 92z" fill="var(--accent-secondary)"/>
                  </svg>
                  BlueSky
                </a>
              </li>
              <li>
                <a
                  href="https://www.flux.ai/ril3y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <Image 
                    src="https://www.flux.ai/static/media/flux_icon.eca0a11ea2f721d680d9.svg" 
                    alt="Flux" 
                    width={20} 
                    height={20} 
                    style={{ display: 'inline-block', verticalAlign: 'middle' }} 
                  />
                  Flux
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <rect width="256" height="256" fill="none"></rect>
                    <circle cx="68" cy="188" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></circle>
                    <path d="M40,80a144,144,0,0,1,144,144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></path>
                    <path d="M40,136a88,88,0,0,1,88,88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></path>
                  </svg>
                  RSS Feed
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/rileycporter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center font-mono text-xs">
          <p> {currentYear} Battle With Bytes. All rights reserved.</p>
          <p className="mt-2">
            <span className="text-green-400">$</span> Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">~</kbd> to access terminal
          </p>
        </div>
      </div>
    </footer>
  );
}
````

## File: src/components/ImageWidget.tsx
````typescript
"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWidgetProps extends Omit<ImageProps, 'alt'> {
  alt: string; // Make alt explicitly required
  caption?: string;
  containerClassName?: string; // Optional class for the main wrapper
  imageClassName?: string;   // Optional class for the Next Image component itself
  // Allow any other Next.js ImageProps like priority, quality, fill, sizes, etc.
}

const ImageWidget: React.FC<ImageWidgetProps> = ({
  src,
  alt,
  width,
  height,
  caption,
  containerClassName = '',
  imageClassName = '',
  priority,
  quality,
  fill,
  sizes,
  ...rest
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isLightboxOpen]);

  // Determine props for Next Image based on whether `fill` is used
  const imageProps: ImageProps = fill 
    ? { src, alt, fill: true, sizes, priority, quality, className: `rounded-lg ${imageClassName}`, ...rest }
    : { src, alt, width, height, priority, quality, className: `rounded-lg ${imageClassName}`, ...rest };

  return (
    <div className={`my-6 ${containerClassName}`}>
      <figure className="relative">
        <div
          className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openLightbox()}
          aria-label={`View larger image: ${alt}`}
        >
          <Image {...imageProps} />
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-center text-gray-400 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
          onClick={closeLightbox} // Close on overlay click
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-caption"
          aria-describedby="lightbox-image-description"
        >
          <div
            className="relative max-w-6xl max-h-[95vh] bg-gray-900 p-4 rounded-xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the image/modal content
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 z-10 p-2 bg-gray-800 text-white rounded-full hover:bg-red-600 transition-colors text-2xl leading-none"
              aria-label="Close lightbox"
            >
              &times;
            </button>
            {/* For the lightbox, we typically want the image to scale to fit while maintaining aspect ratio */}
            {/* The parent needs position relative and defined dimensions or aspect ratio. */}
            {/* Changed h-auto to flex-1 to allow this container to grow within the flex-col parent */}
            <div className="relative w-full flex-1 overflow-hidden flex justify-center items-center">
              {/* DEBUG: Using standard img tag for lightbox to bypass Next/Image issues in modal */}
              <img 
                src={src as string} 
                alt={alt} 
                className="object-contain rounded-lg w-full h-full"
                style={{ display: 'block' }} // Ensure it's not display:none by other styles
              />
            </div>
            {caption && (
              <p id="lightbox-caption" className="mt-3 text-base text-center text-gray-200">
                {caption}
              </p>
            )}
            <p id="lightbox-image-description" className="sr-only">{alt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWidget;
````

## File: src/components/Navigation.tsx
````typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
  { name: "Tools", path: "/tools" },
  { name: "Projects", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a link is clicked or route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-teal-300 font-mono font-bold text-xl">
              <span className="text-white">&lt;</span>
              Battle<span className="text-white">With</span>Bytes
              <span className="text-white">/&gt;</span>
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`nav-link${isActive ? " nav-link--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg // Close Icon
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg // Hamburger Icon
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                      ? "bg-teal-500 text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link {
          position: relative;
          color: #e9faf6;
          font-family: 'Fira Mono', monospace;
          font-size: 1.08rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 0.38rem 1.1rem 0.38rem 1.1rem;
          border-radius: 1.3em;
          background: transparent;
          transition: background 0.18s cubic-bezier(.4,0,.2,1), color 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1);
          outline: none;
          box-shadow: none;
        }
        .nav-link:hover,
        .nav-link:focus {
          background: rgba(71, 230, 193, 0.13);
          color: #47e6c1;
          box-shadow: 0 2px 12px 0 rgba(71, 230, 193, 0.08);
        }
        .nav-link--active {
          background: #47e6c1;
          color: #181f1c;
          box-shadow: 0 2px 16px 0 rgba(71, 230, 193, 0.14);
        }
        .nav-link--active:focus {
          background: #47e6c1;
          color: #181f1c;
        }
      `}</style>
    </nav>
  );
}
````

## File: src/components/QuakeTerminal.tsx
````typescript
"use client"

import { useState, useEffect, useRef } from "react"
import Console from "react-console-emulator"
import { loadCommands } from "@/components/terminal/CommandRegistry"

const registry = loadCommands()

// Map command instances to the format expected by react-console-emulator.
// Note: `execute` expects an array of strings.
const commands = Object.fromEntries(
  Object.entries(registry).map(([name, cmd]) => [
    name,
    {
      description: cmd.description,
      usage: cmd.usage,
      // Pass the arguments as an array and handle both sync and async results
      fn: async (...args: string[]) => {
        const result = cmd.execute(args);
        // Handle both synchronous and asynchronous results
        return result instanceof Promise ? await result : result;
      },
    },
  ])
)

// Custom welcome component for the terminal
const TerminalWelcome = () => (
  <div className="terminal-welcome">
    <div className="ascii-art">BATTLE WITH BYTES</div>
    <p className="terminal-tagline">Ask me about little data.</p>
    <p className="terminal-help">Type &apos;help&apos; to see available commands</p>
  </div>
)

export default function QuakeTerminal() {
  const [open, setOpen] = useState(false)
  const consoleRef = useRef<InstanceType<typeof Console> | null>(null)

  // Handle closing the terminal
  const handleExit = () => {
    setOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "~" || event.code === "Backquote") {
        event.preventDefault()
        event.stopImmediatePropagation()
        setOpen((prev) => !prev)
        // Clear any stray tilde characters from the input after toggling.
        setTimeout(() => {
          const input = document.querySelector(
            'input[name="react-console-emulator__input"]'
          ) as HTMLInputElement | null
          if (input) {
            input.value = input.value.replace(/~/g, "")
          }
        }, 0)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown, { capture: true })
    window.addEventListener("quake-exit", handleExit as EventListener)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true })
      window.removeEventListener("quake-exit", handleExit as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const terminalRoot = document.getElementById('quake-terminal-root');
      if (terminalRoot && !terminalRoot.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const handleClear = () => {
      // Use the Console ref to clear the terminal history
      if (consoleRef.current && typeof consoleRef.current.clearConsole === 'function') {
        consoleRef.current.clearConsole();
      }
    };
    window.addEventListener('quake-clear', handleClear as EventListener);
    return () => {
      window.removeEventListener('quake-clear', handleClear as EventListener);
    };
  }, []);

  // Focus the terminal input when the terminal is opened.
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = document.querySelector(
          'input[name="react-console-emulator__input"]'
        ) as HTMLInputElement | null
        input?.focus()
      }, 0)
    }
  }, [open])

  return (
    <div
      id="quake-terminal-root"
      className={`
        fixed top-0 left-0 w-full bg-black/95 text-green-400 z-50 
        shadow-[0_0_15px_rgba(0,255,157,0.3)] border-b border-green-400/30
        transition-all duration-500 ease-in-out
        max-h-[40vh] overflow-hidden
        backdrop-blur-sm
        ${open ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400/0 via-green-400 to-green-400/0"></div>
      <div className="absolute top-1 right-4 flex space-x-2 p-2">
        <button 
          onClick={handleExit}
          className="text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded px-2 py-1 font-mono"
        >
          close [~]
        </button>
      </div>
      
      {/* Add custom CSS for terminal styling */}
      <style jsx global>{`
        .terminal-welcome {
          padding: 1rem 0;
        }
        
        .ascii-art {
          color: #00ff9d;
          font-weight: bold;
          margin: 0 0 12px 0;
          font-size: 1.8rem;
          letter-spacing: 2px;
          font-family: var(--font-geist-mono), monospace;
          text-shadow: 0 0 5px rgba(0, 255, 157, 0.5);
        }
        
        .terminal-tagline {
          color: #ffffff;
          margin: 0 0 4px 0;
        }
        
        .terminal-help {
          color: #888888;
          margin: 0 0 12px 0;
        }
        
        .react-console-emulator {
          background: transparent !important;
        }
        
        .react-console-emulator__prompt {
          color: #00ff9d !important;
          font-weight: bold !important;
        }
        
        .react-console-emulator__input {
          caret-color: #00ff9d !important;
          color: white !important;
        }
      `}</style>
      
      <Console
        ref={consoleRef}
        autoFocus={true}
        commands={commands}
        welcomeMessage={<TerminalWelcome />}
        promptLabel="> "
        noDefaults={true}
        style={{
          minHeight: "250px",
          maxHeight: "40vh",
          overflow: "auto",
          padding: "2rem 1rem 1rem 1rem",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          backgroundColor: "transparent",
        }}
        contentStyle={{
          padding: "1rem",
          color: "#ededed",
        }}
        inputStyle={{
          color: "#ededed",
          caretColor: "#00ff9d",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
        messageStyle={{
          color: "#00ff9d",
          fontWeight: "bold",
        }}
      />
    </div>
  )
}
````

## File: src/components/RadixTabs.module.css
````css
.list {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid #222;
  padding-bottom: 0.2rem;
}

.trigger {
  position: relative;
  background: none;
  border: none;
  color: var(--foreground);
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.35em 1.1em 0.25em 1.1em;
  margin: 0;
  cursor: pointer;
  outline: none;
  border-radius: 5px 5px 0 0;
  transition: background 0.15s, color 0.15s, border-bottom 0.15s;
}

.trigger:hover,
.trigger:focus-visible {
  background: rgba(0,136,255,0.08); /* subtle blue tint */
  color: var(--accent-secondary);
}

.trigger[data-state="active"],
.trigger[aria-selected="true"] {
  color: var(--accent-secondary);
  background: none;
  border-bottom: 2px solid var(--accent-secondary);
}

.trigger:active {
  filter: brightness(1.07);
}

.trigger:focus-visible {
  outline: 1.5px solid var(--accent-secondary);
  outline-offset: 2px;
}

.tabContent {
  animation: fadeInTab 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInTab {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
````

## File: src/components/RadixTabs.tsx
````typescript
import * as Tabs from '@radix-ui/react-tabs';
import React from 'react';
import styles from './RadixTabs.module.css';

export interface RadixTab {
  label: string;
  value: string;
  content: React.ReactNode;
}

export interface RadixTabsProps {
  tabs: RadixTab[];
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
}

const RadixTabs: React.FC<RadixTabsProps> = ({
  tabs,
  defaultValue,
  className,
  contentClassName,
}) => {
  if (!tabs || tabs.length === 0) return null;
  return (
    <Tabs.Root defaultValue={defaultValue || tabs[0].value} className={className}>
      <Tabs.List className={styles.list}>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value} className={styles.trigger}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          className={contentClassName ? `${contentClassName} ${styles.tabContent}` : styles.tabContent}
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default RadixTabs;
````

## File: src/content/blog/custom-protocol-bruh/index.mdx
````
---
title: "Custom protocol bruh?"
slug: "custom-protocol-bruh"
date: "2025-04-15"
excerpt: "Creating a custom protocol decoder for the Saleae logic analyzer."
tags: ["saleae", "firmware"]
author: "ril3y"
coverImage: "./images/cover.png"
---

import RadixTabs from '../../../components/RadixTabs'
import DropCap from '../../../components/DropCap'
import CodeBlock from '../../../components/CodeBlock'

<DropCap>
Saleae protocol analyzers (custom protocol decoders) must be written in <strong>C++</strong>. Currently, Saleae Logic only supports native analyzers written in C++ as DLLs—there is no official Python or JavaScript API for custom analyzers. In this post, we’ll walk through setting up Visual Studio Code on Windows for developing these DLLs, building a bare-bones C++ decoder for a simple custom protocol, and testing/integration in Saleae Logic.
</DropCap>

## Overview: Custom Protocol Decoder for Saleae

The goal of this project is to create a simple protocol decoder DLL in <strong>C++</strong> that:
- Parses a custom protocol frame.
- Checks for a start byte, a length byte, a payload, and a checksum.
- Integrates with the Saleae logic analyzer via the Saleae C++ SDK.

<RadixTabs
  tabs={[
    {
      label: 'Environment Setup',
      value: 'tab-setup',
      content: (
        <>
          <h3>Setting up Visual Studio Code</h3>
          <p>To build the DLL on Windows:</p>
          <ol>
            <li>
              <strong>Install Visual Studio Code:</strong>  
              Download and install <a href="https://code.visualstudio.com/">VS Code</a> for Windows.
            </li>
            <li>
              <strong>Install Extensions:</strong>  
              Add the official <em>C/C++</em> extension and optionally the <em>CMake Tools</em> extension if you use CMake.
            </li>
            <li>
              <strong>Install Build Tools:</strong>  
              Make sure you have the <a href="https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022">Visual Studio Build Tools</a> installed with the MSVC compiler and Windows SDK.
            </li>
            <li>
              <strong>Workspace Setup:</strong>  
              Create a project folder, open it in VS Code, and configure your build system (using CMake or an MSVC project) to build a DLL.
            </li>
          </ol>
          <p>
            <strong>Placeholder Image:</strong><br />
            <img src="./images/vscode-setup.png" alt="Visual Studio Code Setup" />
          </p>
        </>
      ),
    },
    {
      label: 'Decoder Development',
      value: 'tab-decoder',
      content: (
        <>
          <h3>Building a Bare Bones Custom Protocol Decoder</h3>
          <p>The simple custom protocol format for our decoder is defined as follows:</p>
          <ul>
            <li><strong>Start Byte:</strong> <code>0xAA</code></li>
            <li><strong>Length Byte:</strong> Indicates the number of payload bytes.</li>
            <li><strong>Payload:</strong> Contains the raw data.</li>
            <li><strong>Checksum:</strong> A basic checksum computed over the payload.</li>
          </ul>
          <p>Below is a bare-bones C++ example for the protocol decoder DLL. Saleae's SDK will call this function with captured data:</p>
          <CodeBlock language="cpp" code={`#include <windows.h>
#include <cstdint>
#include <vector>

// Exported function to decode the custom protocol.
extern "C" __declspec(dllexport) int decodeCustomProtocol(const uint8_t* data, int dataSize, std::vector<uint8_t>& output) {
    if (dataSize < 3 || data[0] != 0xAA) {
        return -1; // Invalid frame
    }

    uint8_t length = data[1];
    if (dataSize < (length + 3)) {
        return -2; // Not enough data
    }

    int sum = 0;
    for (int i = 0; i < length; i++) {
        output.push_back(data[2 + i]);
        sum += data[2 + i];
    }
    
    uint8_t expectedChecksum = static_cast<uint8_t>(sum & 0xFF);
    uint8_t receivedChecksum = data[2 + length];
    if (expectedChecksum != receivedChecksum) {
        return -3; // Checksum error
    }
    return 0; // Success
}

// DLL main entry point.
BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved) {
    return TRUE;
}`} />
          <p>
            <strong>Placeholder Image:</strong><br />
            <img src="./images/decoder-code-placeholder.png" alt="Decoder Code Placeholder" />
          </p>
        </>
      ),
    },
    {
      label: 'Testing & Integration',
      value: 'tab-testing',
      content: (
        <>
          <h3>Testing and Integration</h3>
          <ol>
            <li>
              <strong>Build the DLL:</strong>  
              Configure your build system to compile the DLL and ensure the output is placed where Saleae's software can load it.
            </li>
            <li>
              <strong>Integrate with Saleae:</strong>  
              Follow Saleae’s <a href="https://support.saleae.com/hc/en-us/articles/360020540494-Protocol-Decoder-API">protocol decoder documentation</a> to load and test your DLL.
            </li>
            <li>
              <strong>Debug:</strong>  
              Use VS Code’s debugging capabilities by attaching to the Saleae process or adding logging to capture the decoder’s behavior.
            </li>
          </ol>
          <p>
            <strong>Placeholder Image:</strong><br />
            <img src="./images/setup-diagram-placeholder.png" alt="Setup Diagram Placeholder" />
          </p>
        </>
      ),
    },
  ]}
/>

## Conclusion

Using Visual Studio Code to develop a custom protocol decoder DLL for Saleae's logic analyzer streamlines the development and debugging process. This guide provided an overview of setting up your environment, a basic implementation of a custom protocol decoder, and steps for integrating and testing the DLL with Saleae’s software.

Happy coding!
````

## File: src/content/blog/i2c-hdmi-hacks/index.mdx
````
---
title: "I2C HDMI Hacks"
slug: "i2c-hdmi-hacks"
date: "2025-05-08"
excerpt: "Hijack HDMI’s hidden DDC/CI I²C bus to automate input switching from Python on a Raspberry Pi—no remote required."
tags: ["i2c", "hacking", "linux", "raspberrypi", "python", "hdmi", "ddc"]
author: "ril3y"
coverImage: "/images/blog/i2c-hdmi-hacks/cover.png"
---

import RadixTabs from '../../../components/RadixTabs'
import DropCap from '../../../components/DropCap'
import HDMIPinout from '../../../components/HDMIPinout/HDMIPinout'

<DropCap>
Most people think of HDMI as just a video and audio interface, but it also includes a little-known I2C bus (the DDC/CEC channel). By tapping into this interface, you can control HDMI devices in unexpected ways. In this guide, we'll explore how to use Python and I2C to switch HDMI inputs programmatically—turning your Raspberry Pi or Linux device into a powerful remote control for your AV setup.
</DropCap>


This post will walk through the basics of HDMI I2C, hardware considerations, and Python code to automate input switching.

## Overview: HDMI and I2C

- What is the DDC/CEC channel?
- Why HDMI includes I2C
- Practical uses for hackers and tinkerers

## HDMI Pinout and I2C Interface

The HDMI connector contains 19 pins, with pins 15 (SCL) and 16 (SDA) carrying the I2C signals we're interested in. These pins form what's known as the DDC (Display Data Channel) bus.
<HDMIPinout />

The highlighted pins are what we'll be tapping into for our I2C communication. The SCL pin (15) carries the clock signal, while the SDA pin (16) carries the bidirectional data. These pins normally allow the display to communicate its capabilities (like supported resolutions) to the source device, but we can hijack this channel for our own purposes.

## Hardware Setup

- Required cables/adapters
- Raspberry Pi
- HDMI Monitor (that supports DDC/CI)

## Finding the I2C Address on Raspberry Pi

Once your Raspberry Pi is physically connected to the HDMI DDC lines (pins 15/16), you can use the built-in I2C tools to discover which addresses are present on the bus. The `i2cdetect` utility is perfect for this job.

First, list the available I2C buses:

```bash
$ i2cdetect -l
i2c-2   i2c             bcm2835 (i2c@7e805000)                  I2C adapter
```

Here, `i2c-2` is the bus connected to the HDMI port on the Pi. Now scan the bus for devices:

<I2CDetectOutput
  highlights={[
    { 
      address: "37", 
      color: "#ff3333", 
      content: "0x37: Common address for HDMI CEC bridges or control ICs. This is the chip we'll interact with for input switching."
    },
    { 
      address: "50", 
      color: "#00ff9d", 
      content: "0x50: Standard EDID EEPROM address. Contains display capabilities like supported resolutions."
    }
  ]}
/>

This output shows several addresses in use. Most notably:

- **0x37**: This is a common address for HDMI CEC (Consumer Electronics Control) bridges and sometimes for HDMI switches or other control ICs. If you're hacking input switching, this is often the chip you'll want to communicate with!
- **0x50**: This is the standard EDID EEPROM address, where the monitor stores its capabilities. Reading from here gives you the display's supported resolutions and features.
- **Other addresses**: Depending on your monitor or switch, you may see other devices. Addresses like 0x3A, 0x4A, 0x4B, and 0x54 could correspond to additional control chips or features.

> **Tip:** If you're not sure which address to poke, start with 0x37 for control and 0x50 for EDID. Use `i2cdump` or custom Python scripts to probe further!


## Python Implementation

Now that we've identified the I2C addresses on our monitor, we can write Python code to programmatically switch inputs. Here's a minimalist implementation that works reliably:

```python
#!/usr/bin/env python3
import os, fcntl, sys, time

BUS_DEV   = "/dev/i2c-2"    # Your I2C bus device
MON_ADDR  = 0x37           # Monitor's DDC/CI address
VCP_CODE  = 0x60           # Input Source VCP code
NEW_INPUT = int(sys.argv[1], 0) if len(sys.argv)>1 else 0x12  # Default: HDMI-2
I2C_SLAVE = 0x0703         # from <linux/i2c-dev.h>

def build_packet(vcp, value):
    pkt = bytearray([0x51, 0x84, 0x03, vcp, 0x00, value])
    pkt.append((-sum(pkt)) & 0xFF)
    return pkt

def switch_input(value):
    pkt = build_packet(VCP_CODE, value)
    print("Raw packet:", [hex(b) for b in pkt])
    fd = os.open(BUS_DEV, os.O_RDWR)
    try:
        fcntl.ioctl(fd, I2C_SLAVE, MON_ADDR)
        os.write(fd, pkt)
    finally:
        os.close(fd)

if __name__=="__main__":
    if os.geteuid()!=0:
        print("Run as root"); sys.exit(1)
    print(f"Switching to 0x{NEW_INPUT:02X}…")
    switch_input(NEW_INPUT)
    if NEW_INPUT==0x12:
        time.sleep(15)
        switch_input(0x11)
        print("Switched back to 0x11")
```

Here's how it works in action:

```bash
$ sudo python switch_input.py 0x12
Switching to 0x12…
Raw packet: ['0x51', '0x84', '0x3', '0x60', '0x0', '0x12', '0xb6']
Raw packet: ['0x51', '0x84', '0x3', '0x60', '0x0', '0x11', '0xb7']
Switched back to 0x11
```
This works perfectly!  At least for me.  Meaning, there verywell could be issues. 
- Make sure you ran it as root.
- Make sure you are using the right i2c address.
 
### Understanding the DDC/CI Packet Structure

Let's break down exactly what our code is sending over the I2C bus. Each byte in the packet has a specific purpose in the DDC/CI protocol:

<TooltipText
  content="Packet bytes: 0x51 0x84 0x03 0x60 0x00 0x12 0xB6"
  tooltips={[
    {
      text: "0x51",
      color: "#ff3333",
      tooltip: "Sub‑address (or “offset”) for DDC/CI messages. Every write packet to the monitor begins with this byte to indicate you’re talking MCCS/DDC‐CI. —Jean‑Bernard Boichat"
    },
    {
      text: "0x84",
      color: "#00ff9d",
      tooltip: "Top bit (0x80) marks this as a “Set” request. The low 7 bits (0x04) give the number of payload bytes that follow (here, 4 bytes before the checksum). —Jean‑Bernard Boichat"
    },
    {
      text: "0x03",
      color: "#7fdbff",
      tooltip: "MCCS opcode 0x03 = “Set VCP Feature.” This tells the monitor you’re changing a Virtual Control Panel parameter."
    },
    {
      text: "0x60",
      color: "#ff851b",
      tooltip: "The VCP code (0x60) identifying which feature to change—in this case, Input Source (DDC/CI VCP X60)."
    },
    {
      text: "0x00",
      color: "#ffffff",
      tooltip: "High byte of the new value. For VCP values 0–254, the MSB is always zero."
    },
    {
      text: "0x12",
      color: "#ffdc00",
      tooltip: "Low byte of the new value: 0x12 = HDMI‑2."
    },
    {
      text: "0x11",
      color: "#ffdc00",
      tooltip: "Low byte of the new value: 0x11 = HDMI‑1."
    },
    {
      text: "0xB6",
      color: "#b10dc9",
      tooltip: "Checksum: a two’s‑complement sum so that all bytes (including this checksum) add to zero mod 256. For example, sum(0x51+0x84+0x03+0x60+0x00+0x12)=0x4A, and (–0x4A)&0xFF=0xB6."
    },
    {
      text: "0xB7",
      color: "#b10dc9",
      tooltip: "Checksum: a two’s‑complement sum so that all bytes (including this checksum) add to zero mod 256 for the packet ending in 0x11."
    }
  ]}
/>


**1st Packet Breakdown:**

- **0x51**: Source Address - Indicates message is coming from the host device (PC) to the display
- **0x84**: Packet Type - Indicates this is a message with a dedicated length byte
- **0x03**: Data Length - There are 3 data bytes following this byte
- **0x60**: VCP Feature Code - Code for 'Input Source Selection' according to the MCCS specification
- **0x00**: MSB - Most significant byte of the 16-bit value (zero in this case)
- **0x12**: LSB - Least significant byte of the 16-bit value (0x12 = HDMI-2)
- **0xB6**: Checksum - Two's complement of the sum of all previous bytes

When switching back to HDMI-1, only the input value changes to `0x11`, which updates the checksum to `0xB7`:

<TooltipText
  content="Packet bytes: 0x51 0x84 0x03 0x60 0x00 0x11 0xB7"
  tooltips={[
    { text: "0x11", color: "#ffdc00", tooltip: "LSB - Least significant byte containing the input source value for HDMI-1" },
    { text: "0xB7", color: "#b10dc9", tooltip: "Checksum - Recalculated based on the new input value 0x11" }
  ]}
/>

**Second Packet:** Same structure with only two bytes changed:
- **0x11**: LSB - The input source value for HDMI-1 (changed from 0x12)
- **0xB7**: Checksum - Updated for the new packet values

The checksum is calculated as the two's complement of the sum of all previous bytes:

```python
def calculate_checksum(packet_bytes):
    # Sum all bytes
    byte_sum = sum(packet_bytes)
    # Take two's complement (negate and add 1), then take lowest byte
    checksum = (-byte_sum) & 0xFF
    return checksum

# For HDMI-2 packet
packet = [0x51, 0x84, 0x03, 0x60, 0x00, 0x12]
checksum = calculate_checksum(packet)  # Returns 0xB6

# For HDMI-1 packet
packet = [0x51, 0x84, 0x03, 0x60, 0x00, 0x11]
checksum = calculate_checksum(packet)  # Returns 0xB7
```

Understanding this packet structure allows you to send commands to any monitor supporting the DDC/CI standard.

### Understanding Input Source Codes

We know to use `0x11` (HDMI-1) and `0x12` (HDMI-2) based on the MCCS (Monitor Control Command Set) specification, specifically the definition of VCP feature code 0x60, which controls the "Input Source" of the monitor.

#### Official Input Source Values (VCP Code 0x60)

According to the VESA MCCS 2.2 spec — page 57+ — the standard values for input sources are:

| Value | Input Source |
|-------|-------------|
| 0x01  | VGA-1 |
| 0x03  | DVI-1 |
| 0x04  | DVI-2 |
| 0x0F  | DisplayPort-1 |
| 0x10  | DisplayPort-2 |
| **0x11**  | **HDMI-1** |
| **0x12**  | **HDMI-2** |
| 0x1C  | USB-C |
| 0x1E  | Wireless Display |

#### Discovering Your Monitor's Values

You can query your monitor to see what input source codes it supports:

```bash
sudo ddcutil getvcp 0x60
```

It will return something like:

```
VCP code 0x60 (Input Source):
  current value = 0x11, max value = 0x12
```

This confirms that:
- 0x11 is HDMI-1 (currently selected)
- 0x12 is HDMI-2 (supported)

If your monitor had DisplayPort or DVI inputs, you'd likely see those too.



## Conclusion

Unlocking the I2C channel on HDMI opens up a world of possibilities for automation and control. With just a bit of hardware and some Python, you can take command of your devices in ways manufacturers never intended.
What we are doing with it is just to change HDMI inputs.  This project was all to help me understand how I can Control
my custom pc case's front facing LCD.  I also wanted to see if I could make a simple tool to switch HDMI inputs.  This scripts 
is a good starting point for anyone that might want to hack on DDC and I2C on monitors directly from Python.  

## Related Resources

- **ddcutil**: 
  - [Official Documentation](http://www.ddcutil.com/)
  - [GitHub Repository](https://github.com/rockowitz/ddcutil)
- **DDCI**: 
  - [Official Documentation](https://boichat.ch/nicolas/ddcci/specs.html)
````

## File: src/content/blog/introducing-picotag/index.mdx
````
---
title: "Introducing PicoTag: Your Pocket-Sized Hardware Hacking Assistant"
slug: "introducing-picotag"
date: "2024-07-23" 
excerpt: "Meet PicoTag, a modular CircuitPython firmware for the RP2040, designed for hardware interaction, testing, and exploration."
tags: ["circuitpython", "rp2040", "picotag", "firmware", "hacking", "hardware", "cli", "modular"]
author: "ril3y" # Assuming Riley Porter based on the prompt, adjust if needed
coverImage: "./images/concept.png" # Placeholder - ensure this image exists or update path
---

import DropCap from '../../../components/DropCap'



<DropCap>
Ever found yourself needing a quick and easy way to poke at hardware, read GPIO states, interact with SPI or I2C devices, or maybe even dump firmware, without setting up a complex JTAG/SWD debugger or writing throwaway scripts from scratch? Enter **PicoTag**.
</DropCap>

![PicoTag Concept Image](/images/blog/introducing-picotag/concept.png)

## What is PicoTag?

PicoTag is a firmware project built entirely in **CircuitPython**, designed to run on the versatile and affordable **Raspberry Pi Pico (RP2040)**. At its core, PicoTag transforms your Pico into an interactive hardware multitool, accessible via a simple Command-Line Interface (CLI) over USB Serial.

Think of it as a Swiss Army knife for hardware interaction. Need to check if a pin is high or low? Send some SPI commands? Sniff I2C traffic? PicoTag aims to provide a flexible, extensible platform to do just that, leveraging the ease of Python for development and interaction.

## Why PicoTag?

Many hardware interaction tools exist, but they often require specific desktop software, complex setups, or low-level C/C++ programming. PicoTag aims to bridge the gap by:

1.  **Leveraging CircuitPython:** Making hardware interaction accessible through high-level Python code. Easy to understand, modify, and extend.
2.  **Modularity:** Building functionality through self-contained modules that can be easily added or removed from the Pico's filesystem.
3.  **Interactivity:** Providing an immediate CLI for running commands and getting feedback.
4.  **Portability:** The RP2040 Pico is small, cheap, and readily available.

## Current Progress: The Foundation is Laid

Looking at the current codebase (`boot_out.txt` confirms CircuitPython 9.1.1 on a Pico), the foundational elements of PicoTag are already in place:

*   **Modular Architecture:** A robust `ModuleManager` dynamically loads Python modules from the `/modules` directory on the Pico's flash filesystem. Each module encapsulates specific functionality (e.g., interacting with a specific chip, protocol, or interface).
*   **Command-Line Interface (CLI):** A `CLI` class (`cli.py`) provides the user interface over `usb_cdc` (Serial). It handles input, command parsing, backspace, and executes commands registered by the loaded modules. The prompt `(⚡)Pico>` gives it a distinct identity.
*   **Command Handling:** A base `Command` class (`command.py`) allows modules to define their own specific commands with descriptions and execution logic. These commands are registered globally by the `ModuleManager`.
*   **Resource Management:** A `ResourceManager` (`resource_manager.py`) handles shared hardware resources like SPI peripherals (`SPICoreModule`) or LEDs (`LEDsCoreModule`), ensuring modules don't conflict.
*   **Dependency Management:** Modules can declare dependencies (like needing access to the 'spi' resource), and the `ModuleManager` ensures these are met before loading.
*   **Core Services:** Essential services like a configurable Logger (`logger.py`) with color support (`colors.py`) are integrated.
*   **Example Code:** The presence of a `GPIOTester` class (even if commented out in the main execution flow) demonstrates the intended use case – interacting directly with GPIO pins.

Currently, the system boots, initializes core resources (SPI, LEDs), loads any modules found in `/modules`, and presents the user with the CLI, ready to accept commands.

## Future Ideas and Potential Uses

The modular foundation opens up a world of possibilities for PicoTag. Here are just a few ideas:

*   **Protocol Modules:**
    *   **I2C:** Scan buses, read/write from devices, interact with sensors.
    *   **UART:** Bridge UART interfaces, send/receive data.
    *   **1-Wire:** Communicate with devices like DS18B20 temperature sensors.
    *   **CAN Bus:** Interface with CAN networks (requires appropriate transceiver hardware).
    *   **JTAG/SWD:** Basic boundary scan or interaction using the RP2040's PIO for bit-banging (challenging but possible).
*   **Device Interaction Modules:**
    *   **Flash Memory:** Read/write SPI NOR flash chips (like BIOS chips).
    *   **EEPROM:** Interact with I2C or SPI EEPROMs.
    *   **NFC/RFID:** Modules for common NFC/RFID reader ICs (e.g., PN532).
    *   **Display Drivers:** Control small OLED or LCD screens via I2C/SPI.
*   **Testing & Analysis Modules:**
    *   **Logic Analyzer:** Basic logic analysis using PIO and buffering.
    *   **Signal Generator:** Simple PWM or pattern generation.
    *   **GPIO Tester:** An enhanced version of the example, allowing configuration of pull-ups/downs and direction.
*   **Enhanced Framework:**
    *   **Scripting:** Allow sequences of commands to be run from a file.
    *   **SD Card Support:** Load modules or log data to an SD card (the code hints at `sdcard_modules`).
    *   **API Integration:** Develop the `apis.py` concept for inter-module communication or external control.
    *   **Data Sinks:** Utilize the `sink.py` abstraction for flexible output (e.g., logging to file, sending over network via Pico W).

## Conclusion

PicoTag is shaping up to be a promising tool for hardware enthusiasts, developers, and security researchers. By combining the power and flexibility of the RP2040 with the ease of CircuitPython, it lowers the barrier to entry for many common hardware interaction tasks. Its modular design ensures that it can grow and adapt to new challenges and hardware interfaces.

While still in development, the core framework is solid. Keep an eye on this project – your trusty Raspberry Pi Pico might just become your go-to device for your next hardware adventure!

PicoTag is shaping up to be a promising tool for hardware enthusiasts, developers, and security researchers. By combining the power and flexibility of the RP2040 with the ease of CircuitPython, it lowers the barrier to entry for many common hardware interaction tasks. Its modular design ensures that it can grow and adapt to new challenges and hardware interfaces.

While still in development, the core framework is solid. Keep an eye on this project – your trusty Raspberry Pi Pico might just become your go-to device for your next hardware adventure!
````

## File: src/content/blog/lora-without-lorawan/index.mdx
````
---
title: "LoRa without LoRaWAN"
slug: "lora-without-lorawan"
date: "2024-01-15"
excerpt: "Exploring the use of LoRa technology for direct P2P communication, bypassing the LoRaWAN network."
tags: ["LoRa", "Hardware", "Radio", "RAK3172"]
author: "ril3y"
coverImage: "./images/cover.png"
---

import RadixTabs from '../../../components/RadixTabs'
import DropCap from '../../../components/DropCap'

<DropCap>
LoRa (Long Range) technology is often paired with LoRaWAN, but LoRa itself is simply a radio modulation technique. LoRaWAN adds network management, security layers, and other protocol overhead. For many embedded applications, especially those requiring minimal latency, low power, and straightforward point-to-point (P2P) communication, direct LoRa programming is preferable.
</DropCap>

This guide explores programming the RAK3172 module directly, bypassing LoRaWAN completely.

## Overview: Direct LoRa Programming

Direct LoRa programming allows developers to:

- Send and receive raw LoRa packets.
- Precisely manage radio states and transitions.
- Achieve deterministic timing and low latency.
- Minimize firmware complexity and reduce power consumption.

## RAK3172 Module

The RAK3172 integrates an STM32WLE5 microcontroller with an SX1262 radio chip, providing a compact and highly capable platform for custom LoRa solutions.

<RadixTabs
  tabs={[
    {
      label: 'Preamble',
      value: 'tab-preamble',
      content: (
        <>
          <h3>Preamble</h3>
          <p>The preamble is a sequence of symbols sent at the beginning of every LoRa packet. It allows the receiver to detect the presence of a signal and synchronize to the incoming data stream.</p>
          <ul>
            <li><strong>Typical value:</strong> 8–12 symbols (but can be longer for low-power wakeup scenarios)</li>
            <li><strong>Configuration example:</strong></li>
          </ul>
          <CodeBlock code={`// Set the preamble length to 8 symbols\nSX126xSetPreambleLength(&SX126x, 8);`} language="c" />
          <div className="info-box">
            <strong>How does the preamble length affect the signal?</strong><br />
            Setting the preamble length controls how many up-chirp symbols are sent at the start of each LoRa packet. Each up-chirp is a full symbol, and the total number defines how long the receiver has to detect and synchronize to the signal before actual data is sent. More up-chirps = longer preamble = easier synchronization (but longer airtime).
          </div>
          <h4 className="mt-1_5em-placeholder">What does the LoRa preamble look like?</h4>
          <p>The preamble in a LoRa packet is a series of identical up-chirps, which help the receiver synchronize to the incoming signal.</p>
          <div className="packet-diagram">
            <div className="packet-segment preamble">
              <div className="packet-value">REPEATED<br />UP-CHIRPS</div>
              <div className="packet-label">(Preamble, 8 symbols)</div>
            </div>
            <div className="packet-segment sync-word">
              <div className="packet-value">0x12</div>
              <div className="packet-label">SYNC WORD</div>
            </div>
            <div className="packet-segment payload">
              <div className="packet-value">DATA</div>
              <div className="packet-label">PAYLOAD</div>
            </div>
          </div>
          <p className="packet-note">
            <strong>Note:</strong> The LoRa preamble is a series of identical up-chirp symbols, <em>not</em> a bit or byte pattern.
          </p>
          <h4>What is an Up-Chirp in LoRa?</h4>
          <p>In LoRa, an up-chirp is a frequency sweep from the lowest to the highest frequency in the channel. Digitally, for SF7 (spreading factor 7), the baseband up-chirp can be represented as an array of 128 complex samples, each with a specific phase increment:</p>
          <CodeBlock code={`// Pseudo-representation for SF7 (128 samples)\nfor (int i = 0; i < 128; i++) {\n    // upchirp[i] = complex value based on exp(j * 2 * PI * (i*i) / 256)\n    upchirp[i] = calculate_complex_sample(i);\n}`} language="c" />
          <p>This is not a simple binary or hex constant, but a mathematical sequence. The receiver looks for this "chirp" pattern to synchronize.</p>
        </>
      ),
    },
    {
      label: 'Sync Word',
      value: 'tab-sync-word',
      content: (
        <>
          <h3>Sync Word</h3>
          <p>The sync word is a value that follows the preamble in a LoRa packet. It allows the receiver to differentiate between networks operating on the same frequency.</p>
          <ul>
            <li><strong>Typical values:</strong> 0x12 (private networks), 0x34 (public LoRaWAN)</li>
            <li><strong>Configuration example:</strong></li>
          </ul>
          <CodeBlock code={`// Set the sync word for a private network\nSX126xSetSyncWord(&SX126x, 0x12);`} language="c" />
        </>
      ),
    },
    {
      label: 'Spreading Factor',
      value: 'tab-sf',
      content: (
        <>
          <h3>Spreading Factor (SF)</h3>
          <p>The spreading factor determines how many chips represent each bit of data. It's a key parameter that affects range, data rate, and airtime.</p>
          <ul>
            <li><strong>Range:</strong> SF7 (shortest range, highest data rate) to SF12 (longest range, lowest data rate)</li>
            <li><strong>Configuration example:</strong></li>
          </ul>
          <CodeBlock code={`// Set spreading factor to SF9\nSX126xSetSpreadingFactor(&SX126x, 9);`} language="c" />
          <p>For SF7, each symbol contains 2^7 = 128 chips. For SF12, each symbol contains 2^12 = 4096 chips.</p>
        </>
      ),
    },
    {
      label: 'Bandwidth',
      value: 'tab-bw',
      content: (
        <>
          <h3>Bandwidth (BW)</h3>
          <p>Bandwidth is the size of the frequency range used for transmission. It directly affects the data rate and noise immunity.</p>
          <ul>
            <li><strong>Common values:</strong> 125 kHz, 250 kHz, 500 kHz</li>
            <li><strong>Configuration example:</strong></li>
          </ul>
          <CodeBlock code={`// Set bandwidth to 125 kHz\nSX126xSetBandwidth(&SX126x, LORA_BW_125);`} language="c" />
        </>
      ),
    },
    {
      label: 'Coding Rate',
      value: 'tab-cr',
      content: (
        <>
          <h3>Coding Rate (CR)</h3>
          <p>The coding rate adds redundancy to your data to improve error correction capabilities. It's expressed as a fraction like 4/5, 4/6, 4/7, or 4/8.</p>
          <ul>
            <li><strong>Range:</strong> 4/5 (lowest redundancy) to 4/8 (highest redundancy)</li>
            <li><strong>Configuration example:</strong></li>
          </ul>
          <CodeBlock code={`// Set coding rate to 4/6\nSX126xSetCodingRate(&SX126x, LORA_CR_4_6);`} language="c" />
        </>
      ),
    },
  ]}
/>

## Erasing Default Firmware

Before loading custom firmware, erase the default AT-command-based firmware to free up memory and remove unnecessary functionalities.

## Firmware Development with STM32CubeMX

Use STM32CubeMX to configure the firmware:

- **Disable unused peripherals** to conserve resources.
- Enable only the required interfaces, typically:
  - UART for command-line interactions and debugging.
  - GPIO for sensor interfacing and control signals.
  - RTC for scheduled wake-ups and precise timing.
- Activate the SX1262 radio driver for direct radio control.

A detailed setup guide is available on [STM32World's RAK3172 page](https://stm32world.com/wiki/RAK3172#Setting_up_the_IOC_file).

## Direct LoRa Radio Usage

Direct control of the SX1262 radio enables straightforward, clear, and efficient communication:

<CodeBlock
  code={`// Set radio transmission parameters\nRadio.SetTxConfig(MODEM_LORA, power, bandwidth, datarate, codingRate,\n                  preambleLength, fixLen, crcOn, freqHopOn, hopPeriod,\n                  iqInverted, timeout);\n\n// Send data buffer via LoRa\nRadio.Send(buffer, length);`}
  language="c"
/>
````

## File: src/content/blog/whats-hiding-in-my-coffee-maker/index.mdx
````
---
title: "What's Hiding In My Coffee Maker?"
slug: "whats-hiding-in-my-coffee-maker"
date: "2025-04-15"
excerpt: "Using the PicoTag project to dump SPI flash firmware from a coffee maker and explore what's hidden inside."
tags: ["firmware", "reverse engineering", "spi"]
author: "ril3y"
coverImage: "./images/concept.png"
---


<DropCap>
Ever wondered what your coffee maker might be hiding? With the rise of smart appliances, even a humble brew machine could be running embedded firmware — and that means there's something to hack.
In this post, I used my [PicoTag project](https://github.com/ril3y/picotag) to dump the SPI flash memory from my coffee maker and dig into what kind of system it's running.
</DropCap>


---

## Hardware Overview

The flash chip inside the coffee maker is a Winbond **W25Q128JVSQ**, a common 128Mbit (16MB) SPI NOR flash chip.



---

## Step 1: Identifying the Flash Chip

To begin, I opened up the unit and visually identified the flash as:

- **Manufacturer:** Winbond
- **Model:** W25Q128JVSQ
- **Package:** SOIC-8
- **Interface:** SPI
- **Capacity:** 128Mbit (16MB)

I verified the part by searching for the [datasheet](https://www.mouser.com/datasheet/2/949/w25q128jv_revf_03272018_plus-1489608.pdf) and checking the pinout and features.

---

## Step 2: Dumping the Firmware

### Option 1: In-Circuit Dump

First attempt was an in-circuit read using the PicoTag tool, powered via USB:

> **TODO:** Add photo of clip-on connection to flash chip  
> `<Insert Image Here>`

- Connected PicoTag to SPI lines using a SOIC-8 test clip
- Powered the flash externally (3.3V)
- Verified signal integrity with a logic analyzer

This sometimes works — if the MCU isn’t holding the bus or interfering.

### Option 2: Desolder and Dump

If in-circuit read fails:

> **TODO:** Add photo of desoldered chip and breadboard adapter  
> `<Insert Image Here>`

- Carefully desoldered the chip using hot air
- Mounted on a breakout board or directly into a ZIF socket
- Used PicoTag to read and dump the contents

---

## Step 3: Parsing the Dump

After dumping, I saved the binary as `coffeemaker_dump.bin`.

First inspection steps:

```bash
xxd coffeemaker_dump.bin | less
binwalk coffeemaker_dump.bin
strings coffeemaker_dump.bin | less
```
````

## File: src/content/projects/battle-with-bytes-blog/index.mdx
````
---
title: 'Battle With Bytes Blog'
description: 'Launching a personal tech blog built on Next.js and hosted on GitHub Pages. The blog focuses on embedded systems, cybersecurity, reverse engineering, and practical utilities. The project includes custom-built web components, reactive terminal-based UI, and practical, command-line-driven utilities developed in JavaScript and Python.'
coverImage: '/images/projects/battle-with-bytes-blog/project_cover.png'
enabled: false
tags: []
---
````

## File: src/content/projects/boats-no-woes/index.mdx
````
---
enabled: false
title: 'Boats No Woes'
description: 'Developing an ultra-low-power boat monitoring and security system using LoRa wireless communication. This project integrates RAK3172 modules with Particle M404 gateway devices to detect events like hatch openings and battery voltage levels. It emphasizes robust electrical engineering practices, secure OTA firmware updates, efficient battery management, and rugged marine-grade hardware design.'
coverImage: '/images/projects/boats-no-woes/project_cover.png'
tags: []
---
````

## File: src/content/projects/cnc-laser-engraving/index.mdx
````
---
title: 'CNC and Laser Engraving'
description: 'Exploring CNC machining and galvo laser engraving projects, including generating custom depth maps for precise engraving on materials like metal and sandstone. This work combines advanced image processing (Python, Pillow, OpenCV) with practical hardware applications.'
coverImage: '/images/projects/cnc-laser-engraving/project_cover.png'
enabled: true
tags: []
---
````

## File: src/content/projects/custom-automotive-golf-cart/index.mdx
````
---
title: 'Custom Automotive and Golf Cart Projects'
description: 'Restoring and customizing a personal golf cart with a custom epoxy primer and gloss paint finish. This project involves practical automotive painting techniques, using air guns and compressors for a high-quality finish. Plans include detailed custom vinyl wrapping and accent work, incorporating creative techniques like cut tape for precision designs.'
coverImage: '/images/projects/custom-automotive-golf-cart/project_cover.png'
enabled: true
tags: []
---
````

## File: src/content/projects/custom-obdii-interface/index.mdx
````
---
title: 'Custom OBD-II Vehicle Interface'
description: 'Developing an OBD-II-based device to interact with and remotely monitor a 2021 Mazda CX-5. The project focuses on reverse engineering automotive communication protocols, secure remote command execution, and bypassing proprietary LTE systems with custom hardware solutions.'
coverImage: '/images/projects/custom-obdii-interface/project_cover.png'
enabled: false
tags: []
---
````

## File: src/content/projects/home-lab-diy-workspace/index.mdx
````
---
title: 'Home Lab and DIY Workspace'
description: 'Continuously improving a professional-grade home workshop equipped for embedded engineering, electronics, mechanical projects, and various DIY endeavors. Actively maintaining high-quality tooling and equipment for projects across multiple disciplines, including circuit design, PCB fabrication, woodworking, and metalworking.'
coverImage: '/images/projects/home-lab-diy-workspace/project_cover.png'
enabled: false
tags: []
---
````

## File: src/content/projects/personal-culinary-exploration/index.mdx
````
---
title: 'Personal Culinary Exploration'
description: 'Regularly experimenting with diverse culinary techniques, particularly outdoor grilling, barbecue smoking, and international cuisines. Highlights include homemade barbecue chicken, smoked pork belly, cheesy empanadas, and a strong interest in high-quality ingredients and innovative cooking methods.'
coverImage: '/images/projects/personal-culinary-exploration/project_cover.png'
enabled: false
tags: []
---
````

## File: src/content/projects/picotag/index.mdx
````
---
title: "PicoTag"
date: "2025-05-09"
tags: ["circuit-python", "hardware", "reverse engineering", "hacking"]
author: "ril3y"
description: "PicoTag is a portable, open‑source hardware hacking toolkit built around the Raspberry Pi Pico. Its custom CircuitPython firmware presents a USB‑CDC command‑line interface that dynamically loads modular commands—letting you scan and control JTAG/SWD pins, sniff and inject SPI, I²C and UART traffic, drive GPIO banks and NeoPixels, measure voltages, and more. With SD‑card‑based module loading and a lightweight command framework, PicoTag streamlines low‑level debugging, protocol fuzzing, and embedded reverse‑engineering tasks on the go."
github: "https://github.com/ril3y/picotag-hardware"
coverImage: '/images/projects/picotag/picotag2.jpg'
useThemeOverlay: true # Set to false to show the image without the green overlay
---

Coming soon
````

## File: src/content/projects/reverse-engineering-malware-analysis/index.mdx
````
---
enabled: false
title: 'Reverse Engineering and Malware Analysis'
description: 'Actively engaging in reverse engineering, particularly targeting malware written in Rust and Android applications. Using tools like IDA Pro, Androguard, and YARA, along with automation via Python scripting to speed up and refine malware analysis workflows.'
coverImage: '/images/projects/reverse-engineering-malware-analysis/project_cover.png'
tags: []
---
````

## File: src/content/projects/smart-inventory-management/index.mdx
````
---
title: 'Smart Inventory Management System'
description: 'Designing "smart locations," microcontroller-based storage bins that track and identify items via integrated sensors and wireless communications. These units connect to a central inventory management system using websockets, ensuring precise inventory tracking and real-time location updates.'
coverImage: '/images/projects/smart-inventory-management/project_cover.png'
enabled: true
tags: []
---
````

## File: src/content/projects/stm32-embedded-development/index.mdx
````
---
enabled: false
title: 'STM32 Embedded Development'
description: 'Building custom embedded solutions on STM32 microcontrollers, including the STM32WLE5CCU6, with extensive use of STM32CubeMX, Zephyr OS, and debugging via J-Link/SWD. Actively working with firmware bootloaders, custom UART and LoRa command-line interfaces, and power-efficient firmware strategies.'
coverImage: '/images/projects/stm32-embedded-development/project_cover.png'
tags: []
---
````

## File: src/lib/utils/inputUtils.ts
````typescript
'use client';

/**
 * Parses a value with engineering notation suffixes (k, M, m, u, µ, G)
 * and handles optional units like Ω, V, A etc. by ignoring them during parsing.
 * Handles 'mA' specifically for current.
 *
 * @param value The value as a string.
 * @returns The parsed value as a number, or 0 for invalid/empty input.
 */
export const parseValueWithSuffix = (value: string): number => {
  // Handle empty or null input explicitly
  if (!value || value.trim() === '') return 0;

  // Trim whitespace first
  const trimmedValue = value.trim();

  // --- Handle specific formats FIRST ---

  // Handle special case for mA (milliamps) - case-insensitive
  if (/^[-+]?\d*\.?\d*ma$/i.test(trimmedValue)) {
    const numericPart = trimmedValue.replace(/ma$/i, '');
    const num = parseFloat(numericPart); // Use parseFloat for robustness
    return isNaN(num) ? 0 : num / 1000; // Convert mA to A
  }

  // --- Handle general number + optional single-char suffix ---

  // Remove common units AFTER checking for multi-char units like 'mA'
  const cleanValue = trimmedValue.replace(/[ΩVAWFHz]/gi, ''); // Remove units

  // Regex to capture number part and optional single suffix
  // Uses parseFloat internally, so handles "5." or ".5" correctly if parsed.
  // Allows sign.
  const match = cleanValue.match(/^([-+]?\d*\.?\d*)?([kKmMGuµ])?$/i); // Capture num part and suffix

  if (!match || match[0] !== cleanValue) { // Check if the entire string matches the pattern
       // Try parsing as plain number if pattern fails (e.g. just "123")
       const plainNum = parseFloat(cleanValue);
       if (!isNaN(plainNum)) return plainNum;
       // If pattern failed AND it's not a plain number, it's invalid
       return 0;
  }

  const numPartString = match[1] || ''; // Number part (might be empty if only suffix like "k")
  const suffix = match[2]; // The suffix character (e.g., 'k', 'M', 'm') or undefined

  // If only a suffix was provided (e.g. "k", "m") -> Invalid
  if (numPartString === '' && suffix) return 0;
  // If sign only was provided (e.g. "+", "-") -> Invalid
  if (/^[+-]$/.test(numPartString)) return 0;

  // Parse the number part
  const numValue = parseFloat(numPartString);

  // If parsing failed (e.g. "+.", ".") and it wasn't handled above
  if (isNaN(numValue)) {
      // Allow parsing plain numbers like "5" if suffix is missing
       if (!suffix && !isNaN(parseFloat(cleanValue))) {
           return parseFloat(cleanValue);
       }
       return 0; // Invalid if NaN with suffix or unparseable pattern
  }

  // Apply suffix multiplier/divisor if suffix exists
  if (suffix) {
    // IMPORTANT: Switch on the ORIGINAL case suffix from match[2]
    switch (suffix) {
      case 'k':             // Lowercase k
      case 'K':             // Uppercase K
        return numValue * 1000; // kilo

      case 'M':             // Uppercase M (Mega)
        return numValue * 1000000; // mega

      case 'G':             // Uppercase G (Giga)
         // case 'g': // Add if you want lowercase 'g' for Giga too
        return numValue * 1000000000; // giga

      case 'm':             // Lowercase m (milli)
        return numValue / 1000; // milli

      case 'u':             // Lowercase u
      case 'µ':             // Micro symbol
        return numValue / 1000000; // micro

      default:
        // Suffix was captured by regex but isn't in the switch? Return base value.
        return numValue;
    }
  }

  // No suffix, return the parsed number
  return numValue;
};

/**
 * Formats a value with appropriate engineering notation suffix
 *
 * @param value The value as a number
 * @param unit Optional unit to append (e.g., "Ω", "V", "A")
 * @returns The formatted value as a string with appropriate suffix
 */
export const formatValueWithSuffix = (value: number, unit: string = ''): string => {
  if (isNaN(value)) return `NaN${unit}`; // Handle NaN input

  // Handle zero separately to avoid issues with log/negative powers
  if (value === 0) return `0.000${unit}`;

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(3)}G${unit}`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(3)}M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(3)}k${unit}`;
  } else if (value >= 1) {
    // Avoid unnecessary decimals for whole numbers >= 1? Optional.
    // if (value === Math.floor(value)) return `${value}${unit}`;
    return `${value.toFixed(3)}${unit}`;
  } else if (value >= 0.001) {
    return `${(value * 1000).toFixed(3)}m${unit}`;
  } else if (value >= 0.000001) {
    return `${(value * 1000000).toFixed(3)}u${unit}`; // Use 'u' consistently
  } else if (value > 0) {
     // Very small positive numbers -> micro or exponential
     const microVal = value * 1000000;
     if (microVal >= 0.01) { // Show down to 0.01 µΩ
         return `${microVal.toFixed(3)}u${unit}`;
     } else {
         return `${value.toExponential(3)}${unit}`;
     }
  }
  // Handle negative numbers - apply same logic to absolute value then add sign
  else { // value < 0
      const absFormatted = formatValueWithSuffix(Math.abs(value), unit);
      // Check if the formatted value is just the unit (e.g., for very small negatives)
      if (absFormatted === unit || absFormatted === `0.000${unit}`) return `0.000${unit}`;
      return `-${absFormatted}`;
  }
};

/**
 * Validates if the input is a valid number with optional engineering notation suffix
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid number with optional suffix
 */
export const isValidNumberInput = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove any Ω, V, or W symbols for validation
  const cleanValue = value.replace(/[ΩVW]/g, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Handle special case for mA (milliamps)
  if (/^[-+]?\d*\.?\d*ma$/i.test(cleanValue)) {
    return true;
  }
  
  // Handle engineering notation with suffixes
  if (/^[-+]?\d*\.?\d*[kKmMuµG]$/i.test(cleanValue)) {
    // Make sure there's a number before the suffix
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
};

/**
 * Validates if the input is a valid voltage value
 * Allows decimal numbers with optional V symbol
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid voltage value
 */
export const isValidVoltage = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove V symbol if present
  const cleanValue = value.replace(/V/gi, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Allow voltage with k, m, µ suffixes
  if (/^[-+]?\d*\.?\d*[kKmMuµ]$/i.test(cleanValue)) {
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
};

/**
 * Validates if the input is a valid resistance value
 * Allows engineering notation with suffixes and Ω symbol
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid resistance value
 */
export const isValidResistance = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove Ω symbol if present
  const cleanValue = value.replace(/Ω/g, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Allow resistance with k, M, m, µ suffixes
  if (/^[-+]?\d*\.?\d*[kKMmuµ]$/i.test(cleanValue)) {
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
};

/**
 * Creates a function to get parameter warnings based on provided ranges
 * 
 * @param warningRanges Object mapping parameter names to their warning ranges
 * @returns A function that returns warnings for parameter values
 */
export const createParameterWarningFunction = (warningRanges: Record<string, {
    min?: number;
    max?: number;
    checkFn?: (value: number) => boolean;
    warningMessage: string;
}>) => {
    return (paramName: string, value: string | number): string => {
        const range = warningRanges[paramName];
        if (!range) return '';

        // Convert string to number if needed
        const numValue = typeof value === 'string' 
            ? parseValueWithSuffix(value)
            : value;

        // Check if value is outside range or fails custom check
        if (
            (range.min !== undefined && numValue < range.min) ||
            (range.max !== undefined && numValue > range.max) ||
            (range.checkFn && range.checkFn(numValue))
        ) {
            return range.warningMessage;
        }

        return '';
    };
};

/**
 * Creates a function to get parameter tooltips
 * 
 * @param tooltips Object mapping parameter names to their tooltips
 * @returns A function that returns tooltips for parameters
 */
export const createParameterTooltipFunction = (tooltips: Record<string, string>) => {
    return (paramName: string): string => {
        return tooltips[paramName] || '';
    };
};

/**
 * Parses a resistance value with suffixes (k, M, etc.) and Ω symbol
 * Alias for parseValueWithSuffix for backward compatibility
 * 
 * @param value The resistance value as a string
 * @returns The parsed resistance value as a number
 */
export const parseResistance = (value: string): number => {
    return parseValueWithSuffix(value);
};

/**
 * Formats a resistance value with appropriate suffix and Ω symbol
 * 
 * @param value The resistance value as a number
 * @returns The formatted resistance value as a string with Ω symbol
 */
export const formatResistance = (value: number): string => {
    return formatValueWithSuffix(value, 'Ω');
};

/**
 * Checks if a parameter value is within a reasonable range for MOSFET applications
 * Returns a warning message if the value is outside the expected range
 * 
 * @param paramType The type of parameter being checked
 * @param value The value to check
 * @param warningRanges Optional custom warning ranges for different parameter types
 * @returns Warning message if value is unusual, empty string otherwise
 */
export const getParameterWarning = (
  paramType: string, 
  value: string | number,
  warningRanges?: Record<string, {
    min?: number;
    max?: number;
    checkFn?: (value: number) => boolean;
    warningMessage: string;
  }>
): string => {
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? 
    (paramType === 'loadResistance' || paramType === 'resistance' ? parseValueWithSuffix(value) : parseFloat(value)) : 
    value;
  
  // Skip check for empty or invalid values
  if (isNaN(numValue)) return '';

  // Use custom warning ranges if provided
  if (warningRanges && warningRanges[paramType]) {
    const range = warningRanges[paramType];
    
    // Check custom function if provided
    if (range.checkFn && range.checkFn(numValue)) {
      return range.warningMessage;
    }
    
    // Check min/max ranges
    if (range.min !== undefined && numValue < range.min) {
      return range.warningMessage;
    }
    
    if (range.max !== undefined && numValue > range.max) {
      return range.warningMessage;
    }
    
    return '';
  }
  
  // Default MOSFET-specific warnings if no custom ranges provided
  switch (paramType) {
    case 'loadResistance':
    case 'resistance':
      if (numValue > 100000) {
        return 'Warning: Resistance is unusually high for typical applications.';
      } else if (numValue < 1) {
        return 'Warning: Resistance is extremely low. This may cause excessive current flow.';
      }
      break;
    
    case 'vg':
    case 'voltage':
      if (Math.abs(numValue) > 20) {
        return 'Warning: Voltage is unusually high.';
      }
      break;
    
    case 'vcc':
      if (numValue > 50) {
        return 'Warning: Supply voltage is high. Ensure this is within the component\'s maximum rating.';
      } else if (numValue < 1) {
        return 'Warning: Supply voltage is very low.';
      }
      break;
    
    case 'vth':
      if (Math.abs(numValue) > 10) {
        return 'Warning: Threshold voltage is unusually high.';
      }
      break;
    
    case 'rds_on':
      if (numValue > 100) {
        return 'Warning: On-resistance is unusually high.';
      } else if (numValue < 0.001) {
        return 'Warning: On-resistance is extremely low.';
      }
      break;
      
    case 'current':
      if (numValue > 10) {
        return 'Warning: Current is unusually high.';
      } else if (numValue < 0.0001) {
        return 'Warning: Current is extremely low.';
      }
      break;
      
    case 'power':
      if (numValue > 100) {
        return 'Warning: Power is unusually high.';
      } else if (numValue < 0.0001) {
        return 'Warning: Power is extremely low.';
      }
      break;
  }
  
  return '';
};

/**
 * Gets a tooltip description for a parameter
 * 
 * @param paramType The type of parameter
 * @param tooltips Optional custom tooltips for different parameter types
 * @returns Description of the parameter
 */
export const getParameterTooltip = (
  paramType: string,
  tooltips?: Record<string, string>
): string => {
  // Use custom tooltips if provided
  if (tooltips && tooltips[paramType]) {
    return tooltips[paramType];
  }
  
  // Default MOSFET-specific tooltips
  switch (paramType) {
    case 'vth':
      return 'Threshold Voltage (Vth): The gate-source voltage at which the MOSFET begins to conduct. For N-channel, typically positive (1-4V). For P-channel, typically negative (-1 to -4V). This is a key parameter that determines when the MOSFET turns on.';
    
    case 'rds_on':
      return 'On Resistance (Rds_on): The drain-source resistance when the MOSFET is fully conducting. Lower values (0.001Ω to 1Ω) mean less power dissipation and higher efficiency. This is the resistance between drain and source when the MOSFET is fully turned on.';
    
    case 'vg':
      return 'Gate Voltage (Vg): The voltage applied to the gate terminal. Controls whether the MOSFET conducts or not. Must exceed threshold voltage (Vth) to turn on an N-channel MOSFET or be below Vth for P-channel.';
    
    case 'vcc':
      return 'Supply Voltage (Vcc): The main power supply voltage for the circuit. Provides the potential difference needed to drive current through the load when the MOSFET is conducting.';
    
    case 'vs':
      return 'Source Voltage (Vs): The voltage at the source terminal. For N-channel MOSFETs, typically connected to ground (0V). For P-channel MOSFETs, typically connected to Vcc.';
    
    case 'loadResistance':
    case 'resistance':
      return 'Resistance (Ω): The resistance of the component or circuit. Can use suffixes like k (kilo), M (mega), m (milli), u (micro).';
      
    case 'voltage':
      return 'Voltage (V): The electrical potential difference. Measured in volts (V).';
      
    case 'current':
      return 'Current (I): The flow of electrical charge. Measured in amperes (A).';
      
    case 'power':
      return 'Power (P): The rate of energy transfer. Measured in watts (W).';
    
    default:
      return '';
  }
};

/**
 * Field types for validation
 */
export type FieldType = 'voltage' | 'current' | 'resistance' | 'power' | 'generic';

/**
 * Parse a value based on field type with appropriate default units
 * - current: plain numbers treated as A (e.g., 5 → 5A)
 * - resistance: plain numbers treated as Ω (e.g., 5 → 5Ω)
 * - power: plain numbers treated as W (e.g., 5 → 5W)
 * - voltage: plain numbers treated as V (e.g., 5 → 5V)
 * 
 * @param value The value to parse
 * @param fieldType The type of field
 * @returns The parsed value as a number
 */
export const parseFieldValue = (
  value: string,
  fieldType: FieldType = 'generic'
): number => {
  if (!value || value.trim() === '') return 0;
  
  // If it's a plain number with no suffix, treat it as the base unit
  if (!isNaN(Number(value)) && !value.match(/[a-zA-Z]/)) {
    return Number(value); // All plain numbers are in their base unit (A, V, Ω, W)
  }
  
  // Handle special case for mA (milliamps) - both "ma" and "m" suffixes
  if (fieldType === 'current') {
    // Check for explicit mA suffix
    if (/^\d*\.?\d*ma$/i.test(value)) {
      const numericPart = value.replace(/ma$/i, '');
      return Number(numericPart) / 1000; // Convert mA to A
    }
    
    // Also check for just "m" suffix for current (interpret as mA)
    if (/^\d*\.?\d*m$/i.test(value)) {
      const numericPart = value.replace(/m$/i, '');
      return Number(numericPart) / 1000; // Convert mA to A
    }
  }
  
  // Use standard parser for values with other suffixes
  return parseValueWithSuffix(value);
};

/**
 * Validates input based on field type
 * Allows any text input but provides validation status
 * 
 * @param value The input value to validate
 * @param fieldType The type of field being validated
 * @returns Object with validation status and parsed value
 */
export const validateFieldInput = (
  value: string,
  fieldType: FieldType = 'generic'
): { isValid: boolean; parsedValue: number } => {
  // Empty values are considered valid but with zero value
  if (!value || value.trim() === '') {
    return { isValid: true, parsedValue: 0 };
  }
  
  let parsedValue = 0;
  let isValid = false;
  
  // If it's a plain number with no suffix
  if (!isNaN(Number(value)) && !value.match(/[a-zA-Z]/)) {
    parsedValue = parseFieldValue(value, fieldType);
    isValid = true;
    return { isValid, parsedValue };
  }
  
  // For values with suffixes, validate based on field type
  switch (fieldType) {
    case 'current':
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'voltage':
      if (isValidVoltage(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'resistance':
      if (isValidResistance(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'power':
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'generic':
    default:
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
  }
  
  return { isValid, parsedValue };
};
````

## File: src/lib/utils/projects.ts
````typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

export interface ProjectMetadata {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  contentFile?: string; 
  date?: string;
  tags?: string[];
  author?: string;
  github?: string;
  demo?: string;
  enabled?: boolean;
  useThemeOverlay?: boolean; // Controls whether to apply a color overlay to project image
}

export function getAllProjects(): ProjectMetadata[] {
  const projectSlugs = fs.readdirSync(projectsDirectory);

  const projects = projectSlugs
    .map((slug) => {
      const fullPath = path.join(projectsDirectory, slug, 'index.mdx');
      if (!fs.existsSync(fullPath)) {
        return null; 
      }
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      if (typeof data.enabled !== 'undefined' && data.enabled === false) {
        return null;
      }

      return {
        slug,
        title: data.title || 'Untitled Project',
        description: data.description || data.excerpt || 'No description available.', 
        coverImage: data.coverImage || undefined,
        contentFile: data.contentFile || undefined, 
        date: data.date || undefined,
        tags: data.tags || [],
        author: data.author || undefined,
        github: data.github || undefined,
        demo: data.demo || undefined,
        enabled: typeof data.enabled !== 'undefined' ? data.enabled : true,
        useThemeOverlay: typeof data.useThemeOverlay !== 'undefined' ? data.useThemeOverlay : true, // Default to true
      } as ProjectMetadata;
    })
    .filter((project): project is ProjectMetadata => project !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  return projects;
}
````

## File: src/lib/utils/seo.ts
````typescript
/**
 * SEO utilities for Battle With Bytes
 * Helps generate consistent metadata across the site
 */

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'tool';
  publishedAt?: string;
  updatedAt?: string;
}

/**
 * Default SEO values
 */
export const defaultSEO: SEOProps = {
  title: 'Battle With Bytes | Cybersecurity, Hardware & Software Engineering',
  description: 'Explore cybersecurity concepts, hardware projects, and software engineering tools with interactive calculators and in-depth tutorials.',
  keywords: [
    'cybersecurity', 
    'embedded hardware', 
    'software engineering', 
    'electronics', 
    'programming', 
    'engineering tools', 
    'MOSFET calculator', 
    'Ohm\'s Law calculator'
  ],
  ogImage: '/images/og-image.png',
  type: 'website'
};

/**
 * Generate metadata for a page
 * @param props Custom SEO properties for the page
 * @returns Complete SEO metadata object
 */
export function generateSEO(props: Partial<SEOProps> = {}): SEOProps {
  return {
    ...defaultSEO,
    ...props,
    // Ensure title has site name if not already included
    title: props.title 
      ? (props.title.includes('Battle With Bytes') 
          ? props.title 
          : `${props.title} | Battle With Bytes`)
      : defaultSEO.title,
    // Combine keywords
    keywords: [
      ...(defaultSEO.keywords || []),
      ...(props.keywords || [])
    ]
  };
}

/**
 * Generate structured data for tools
 * @param name Tool name
 * @param description Tool description
 * @param url Tool URL
 * @returns JSON-LD structured data
 */
export function generateToolSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': name,
    'description': description,
    'applicationCategory': 'EngineeringApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'url': `https://battlewithbytes.io${url}`
  };
}

/**
 * Generate structured data for blog articles
 * @param title Article title
 * @param description Article description
 * @param url Article URL
 * @param publishedAt Publication date
 * @param updatedAt Last update date
 * @param imageUrl Featured image URL
 * @returns JSON-LD structured data
 */
export function generateArticleSchema(
  title: string, 
  description: string, 
  url: string,
  publishedAt: string,
  updatedAt?: string,
  imageUrl?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': description,
    'datePublished': publishedAt,
    'dateModified': updatedAt || publishedAt,
    'image': imageUrl ? `https://battlewithbytes.io${imageUrl}` : undefined,
    'url': `https://battlewithbytes.io${url}`,
    'author': {
      '@type': 'Person',
      'name': 'Battle With Bytes'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Battle With Bytes',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://battlewithbytes.io/images/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://battlewithbytes.io${url}`
    }
  };
}
````

## File: src/lib/utils/Tooltip.tsx
````typescript
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// Create a global state to track the active tooltip
let activeTooltipId: string | null = null;

/**
 * A reusable tooltip component that can be used across different tools
 * 
 * @param text The tooltip text to display
 * @param children The element that the tooltip will be attached to
 * @param position The position of the tooltip relative to the element (default: 'top')
 * @param className Additional CSS classes to apply to the tooltip
 */
const Tooltip: React.FC<TooltipProps> = ({ 
  text, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to check if child contains an input element that has focus
  const checkChildFocus = () => {
    if (childRef.current) {
      const inputs = childRef.current.querySelectorAll('input, textarea, select');
      const hasFocusedInput = Array.from(inputs).some(input => document.activeElement === input);
      if (hasFocusedInput) {
        setShowTooltip(false);
      }
    }
  };

  const handleShowTooltip = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to show the tooltip
    timeoutRef.current = setTimeout(() => {
      // Close any other open tooltips
      if (activeTooltipId && activeTooltipId !== tooltipId) {
        // This will trigger a re-render for any other open tooltip
        document.dispatchEvent(new CustomEvent('closeOtherTooltips', {
          detail: { currentTooltipId: tooltipId }
        }));
      }
      
      // Set this as the active tooltip
      activeTooltipId = tooltipId;
      setShowTooltip(true);
    }, 500); // 500ms delay
  };
  
  const handleHideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (activeTooltipId === tooltipId) {
      activeTooltipId = null;
    }
    
    setShowTooltip(false);
  }, [tooltipId]);
  
  // Add event listeners for focus, blur, and keyboard events
  useEffect(() => {
    const handleFocus = () => {
      checkChildFocus();
    };
    
    const handleKeyDown = () => {
      handleHideTooltip();
    };
    
    const handleCloseOtherTooltips = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.currentTooltipId !== tooltipId) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('closeOtherTooltips', handleCloseOtherTooltips as EventListener);
    
    // Clean up event listeners on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('closeOtherTooltips', handleCloseOtherTooltips as EventListener);
      
      // Clear active tooltip if this component is unmounted while active
      if (activeTooltipId === tooltipId) {
        activeTooltipId = null;
      }
    };
  }, [tooltipId, handleHideTooltip]);

  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block w-full">
      <div
        ref={childRef}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={() => handleHideTooltip()}
        className="w-full"
      >
        {children}
        {showTooltip && (
          <div 
            className={`
              absolute z-50 p-2 text-sm font-mono
              bg-[#0a0a0a] text-[#ededed]
              rounded-md max-w-xs backdrop-blur-sm
              animate-fadeIn
              ${positionClasses[position]} ${className}
            `}
            style={{
              boxShadow: '0 0 10px rgba(0, 136, 255, 0.4), 0 0 20px rgba(0, 255, 157, 0.2)',
              border: '1px solid #0088ff',
              borderLeft: '3px solid #00ff9d',
              backgroundImage: 'linear-gradient(135deg, rgba(0, 136, 255, 0.05) 25%, transparent 25%, transparent 50%, rgba(0, 136, 255, 0.05) 50%, rgba(0, 136, 255, 0.05) 75%, transparent 75%, transparent)',
              backgroundSize: '20px 20px',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            <div className="relative z-10">
              {text}
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#00ff9d]" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}></span>
            </div>
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
````

## File: src/lib/blog.ts
````typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const isDev = process.env.NODE_ENV === 'development';

// Define the structure for blog post metadata
export interface BlogMetadata {
  title: string;
  slug: string; // Add slug here for convenience
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  coverImage?: string;
}

// Define the structure for a full blog post with serialized content
export interface BlogPost {
  metadata: BlogMetadata;
  content: MDXRemoteSerializeResult; // Changed from string
}

export function getBlogSlugs(): string[] {
  try {
    return fs.readdirSync(BLOG_DIR).filter(dir => {
      const fullPath = path.join(BLOG_DIR, dir);
      // Ensure it's a directory and contains index.mdx
      return fs.statSync(fullPath).isDirectory() && 
             fs.existsSync(path.join(fullPath, 'index.mdx'));
    });
  } catch (error) {
    console.error("Error reading blog directory:", error);
    return [];
  }
}

// Synchronous function to get only metadata for a single post
export function getBlogPostMetadata(slug: string): BlogMetadata | null {
  const contentPath = path.join(BLOG_DIR, slug, 'index.mdx');
  if (!fs.existsSync(contentPath)) {
    console.warn(`[Metadata] index.mdx not found for slug: ${slug}`);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    const { data } = matter(fileContent);

    // If enabled is explicitly false, skip this post
    if (typeof data.enabled !== 'undefined' && data.enabled === false) {
      return null;
    }

    // Process cover image path
    let coverImage = data.coverImage;
    if (coverImage && coverImage.startsWith('./')) {
      const imageName = path.basename(coverImage);
      coverImage = `/images/blog/${slug}/${imageName}`;
      if (isDev) {
        coverImage = `${coverImage}?t=${new Date().toISOString().split('T')[0]}`;
      }
    }

    // Basic validation
    if (!data.title || !data.date || !data.excerpt) {
        console.warn(`[Metadata] Missing required fields (title, date, excerpt) for slug: ${slug}`);
        // Provide defaults or handle as needed, here returning basic info
    }

    return {
      slug: slug, // Include the slug
      title: data.title || 'Untitled Post',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || 'Battle With Bytes',
      coverImage: coverImage,
    };
  } catch (error) {
    console.error(`Error reading or parsing metadata for slug ${slug}:`, error);
    return null;
  }
}

// Synchronous function to get metadata for all posts, sorted by date
export function getBlogPostsMetadata(): BlogMetadata[] {
  const slugs = getBlogSlugs();
  console.log(`[DEBUG] Found blog slugs for metadata:`, slugs);
  
  const posts = slugs
    .map(slug => getBlogPostMetadata(slug))
    .filter((post): post is BlogMetadata => post !== null) // Type guard to remove nulls
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`[DEBUG] Processed metadata for ${posts.length} posts.`);
  return posts;
}

// Async function to get a single post with *serialized* content
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const contentPath = path.join(BLOG_DIR, slug, 'index.mdx');
   if (!fs.existsSync(contentPath)) {
    console.warn(`[Content] index.mdx not found for slug: ${slug}`);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    const { data, content } = matter(fileContent); // Get both data and content

    // If enabled is explicitly false, skip this post
    if (typeof data.enabled !== 'undefined' && data.enabled === false) {
      return null;
    }

    // Serialize the MDX content
    const mdxSource = await serialize(content, {
        // Optionally pass scope variables available to MDX
        // scope: data,
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                rehypeSlug, // Add slugs to headings
                [rehypeAutolinkHeadings, {behavior: 'wrap'}] // Add links to headings
            ],
            format: 'mdx' // Ensure format is set if needed
        },
        parseFrontmatter: false // We already parsed it with gray-matter
    });

    // Process cover image path (duplicated from getBlogPostMetadata - consider refactoring)
    let coverImage = data.coverImage;
    if (coverImage && coverImage.startsWith('./')) {
      const imageName = path.basename(coverImage);
      coverImage = `/images/blog/${slug}/${imageName}`;
      if (isDev) {
        coverImage = `${coverImage}?t=${new Date().toISOString().split('T')[0]}`;
      }
    }

    return {
      metadata: {
        slug: slug,
        title: data.title || 'Untitled Post',
        date: data.date || new Date().toISOString().split('T')[0],
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        author: data.author || 'Battle With Bytes',
        coverImage: coverImage,
      },
      content: mdxSource, // Return the serialized content
    };
  } catch (error) {
      console.error(`Error processing or serializing blog post ${slug}:`, error);
      return null;
  }
}


// Use a more compatible approach for development (CACHE REMOVED as static generation handles this)
// let cachedPosts: BlogMetadata[] | null = null; // Changed to BlogMetadata

// REMOVED getAllBlogPosts function as getBlogPostsMetadata serves the listing purpose
// export function getAllBlogPosts(): BlogMetadata[] { ... }

export function getBlogPostsByTag(tag: string): BlogMetadata[] {
  return getBlogPostsMetadata().filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getBlogPostsMetadata(); // Use metadata function
  const tagCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
````

## File: src/styles/dropcap.css
````css
.dropcap-paragraph::first-letter {
  color: #7fdc7a;
  background: rgba(127, 220, 122, 0.05);
  border: 1px solid #7fdc7a;
  border-radius: 3px;
  font-size: 2.7em;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 700;
  float: left;
  line-height: 0.9;
  margin-right: 0.18em;
  margin-bottom: 0.01em;
  padding: 0.01em 0.10em 0.01em 0.10em;
  box-shadow: 0 0 2px #7fdc7a33;
  letter-spacing: -0.02em;
  text-shadow: 0 0 1px #7fdc7a55;
  transition: box-shadow 0.2s;
}
````

## File: src/styles/prism-theme.css
````css
/**
 * Custom Prism.js theme for Battle With Bytes
 * Based on cyberpunk styling with green accents
 */

code[class*="language-"],
pre[class*="language-"] {
  color: #f8f8f2;
  background: none;
  text-shadow: 0 1px rgba(0, 0, 0, 0.3);
  font-family: "JetBrains Mono", Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  tab-size: 4;
  hyphens: none;
}

/* Code blocks */
pre[class*="language-"] {
  padding: 1em;
  margin: .5em 0;
  overflow: auto;
  border-radius: 0.3em;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.1);
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  background: #1a1a1a;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: .1em;
  border-radius: .3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a9955;
}

.token.punctuation {
  color: #9abdf5;
}

.token.namespace {
  opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #ff79c6;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #00ff9d; /* Brand green color */
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #00aeff;
}

.token.function,
.token.class-name {
  color: #ffcb6b;
}

.token.regex,
.token.important,
.token.variable {
  color: #f56565;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

/* Line highlighting */
.line-highlight {
  background: rgba(0, 255, 157, 0.08);
  box-shadow: inset 5px 0 0 rgba(0, 255, 157, 0.5);
}

/* Line numbers */
.line-numbers .line-numbers-rows {
  border-right: 1px solid #333;
}

.line-numbers-rows > span:before {
  color: #666;
}

/* Line highlighting */
.command-line-prompt {
  border-right: 1px solid #333;
}

.command-line-prompt > span:before {
  color: #666;
}
````

## File: src/types/react-console-emulator.d.ts
````typescript
declare module 'react-console-emulator';
````

## File: tests/blog/blog-system.test.js
````javascript
const fs = require('fs');
const path = require('path');

// Path to the blog directory
const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

describe('Battle With Bytes Blog System', () => {
  describe('Blog Structure', () => {
    it('should have the correct blog directory structure', () => {
      expect(fs.existsSync(BLOG_DIR)).toBe(true);
    });
    
    it('should have at least one blog post', () => {
      const blogPosts = fs.readdirSync(BLOG_DIR).filter(dir => {
        const fullPath = path.join(BLOG_DIR, dir);
        return fs.statSync(fullPath).isDirectory();
      });
      
      expect(blogPosts.length).toBeGreaterThan(0);
    });
  });
  
  describe('Blog Post Format', () => {
    let blogPost;
    let blogPostPath;
    
    beforeAll(() => {
      // Find a blog post to test
      const blogPosts = fs.readdirSync(BLOG_DIR).filter(dir => {
        const fullPath = path.join(BLOG_DIR, dir);
        return fs.statSync(fullPath).isDirectory();
      });
      
      if (blogPosts.length > 0) {
        blogPost = blogPosts[0];
        blogPostPath = path.join(BLOG_DIR, blogPost);
      }
    });
    
    it('should have index.mdx and meta.txt files', () => {
      expect(blogPost).toBeDefined();
      expect(fs.existsSync(path.join(blogPostPath, 'index.mdx'))).toBe(true);
      expect(fs.existsSync(path.join(blogPostPath, 'meta.txt'))).toBe(true);
    });
    
    it('should have properly formatted meta.txt file', () => {
      const metaPath = path.join(blogPostPath, 'meta.txt');
      const metaContent = fs.readFileSync(metaPath, 'utf8');
      
      // Check required metadata fields
      expect(metaContent).toMatch(/title:\s*"[^"]+"/);
      expect(metaContent).toMatch(/date:\s*"[^"]+"/);
      expect(metaContent).toMatch(/excerpt:\s*"[^"]+"/);
      expect(metaContent).toMatch(/tags:\s*\[.*\]/);
      expect(metaContent).toMatch(/author:\s*"[^"]+"/);
    });
    
    it('should have properly formatted index.mdx file without frontmatter', () => {
      const mdxPath = path.join(blogPostPath, 'index.mdx');
      const mdxContent = fs.readFileSync(mdxPath, 'utf8');
      
      // MDX file should not contain frontmatter delimiters
      const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
      expect(mdxContent.match(frontmatterRegex)).toBeNull();
      
      // Should start with a heading
      expect(mdxContent.trim().startsWith('#')).toBe(true);
    });
  });
});
````

## File: tests/lib/utils/debug-parser.test.ts
````typescript
import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('Debug parseValueWithSuffix', () => {
  test('debug actual behavior', () => {
    console.log('2A =>', parseValueWithSuffix('2A'));
    console.log('5 =>', parseValueWithSuffix('5'));
    console.log('10k =>', parseValueWithSuffix('10k'));
    console.log('0.04W =>', parseValueWithSuffix('0.04W'));
    console.log('20W =>', parseValueWithSuffix('20W'));
    console.log('100mA =>', parseValueWithSuffix('100mA'));
    
    // Just to make the test pass
    expect(true).toBe(true);
  });
});
````

## File: tests/lib/utils/detailed-debug.test.ts
````typescript
import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator'; 
import {
  calculateOhmsLaw,
  validateInputs
} from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils'; 

import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('Detailed Debug Tests', () => {
  test('debug calculateOhmsLaw behavior', () => {
    // Test voltage calculation
    const voltageValues: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
    const voltageResult = calculateOhmsLaw(voltageValues, 'voltage');
    console.log('Voltage calculation result:', {
      voltage: voltageResult.voltage,
      current: voltageResult.current,
      resistance: voltageResult.resistance,
      power: voltageResult.power,
      calculatedProperty: voltageResult.calculatedProperty,
      displayCurrentInMilliamps: voltageResult.displayCurrentInMilliamps
    });
    
    // Test current calculation
    const currentValues: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
    const currentResult = calculateOhmsLaw(currentValues, 'current');
    console.log('Current calculation result:', {
      voltage: currentResult.voltage,
      current: currentResult.current,
      resistance: currentResult.resistance,
      power: currentResult.power,
      calculatedProperty: currentResult.calculatedProperty,
      displayCurrentInMilliamps: currentResult.displayCurrentInMilliamps
    });
    
    // Test resistance calculation
    const resistanceValues: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
    const resistanceResult = calculateOhmsLaw(resistanceValues, 'resistance');
    console.log('Resistance calculation result:', {
      voltage: resistanceResult.voltage,
      current: resistanceResult.current,
      resistance: resistanceResult.resistance,
      power: resistanceResult.power,
      calculatedProperty: resistanceResult.calculatedProperty,
      displayCurrentInMilliamps: resistanceResult.displayCurrentInMilliamps
    });
    
    // Test power calculation
    const powerValues: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
    const powerResult = calculateOhmsLaw(powerValues, 'power');
    console.log('Power calculation result:', {
      voltage: powerResult.voltage,
      current: powerResult.current,
      resistance: powerResult.resistance,
      power: powerResult.power,
      calculatedProperty: powerResult.calculatedProperty,
      displayCurrentInMilliamps: powerResult.displayCurrentInMilliamps
    });
    
    // Just to make the test pass
    expect(true).toBe(true);
  });
});
````

## File: tests/lib/utils/inputUtils.test.ts
````typescript
import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator'; 
import {
  calculateOhmsLaw,
  validateInputs
} from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils'; 

import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe("Ohm's Law Utilities", () => {
  // --- Mock Values ---
  const validSetVR: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
  const validSetVI: OhmsLawValues = { voltage: '12', current: '100mA', resistance: '', power: '' };
  const validSetIR: OhmsLawValues = { voltage: '', current: '2A', resistance: '5', power: '' };
  const validSetVP: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '24W' };
  const validSetIP: OhmsLawValues = { voltage: '', current: '2A', resistance: '', power: '20W' };
  const validSetRP: OhmsLawValues = { voltage: '', current: '', resistance: '10k', power: '0.04W' }; // 40mW

  const invalidSetV: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '' };
  const invalidSetI: OhmsLawValues = { voltage: '', current: '1A', resistance: '', power: '' };
  const invalidSetR: OhmsLawValues = { voltage: '', current: '', resistance: '100', power: '' };
  const invalidSetP: OhmsLawValues = { voltage: '', current: '', resistance: '', power: '10W' };
  const invalidSetNone: OhmsLawValues = { voltage: '', current: '', resistance: '', power: '' };
  const invalidSetThree: OhmsLawValues = { voltage: '12', current: '1A', resistance: '12', power: '' };

  // --- validateInputs Tests ---
  describe('validateInputs', () => {
    // Add a debug test for the parser
    test('TEMP DEBUG: parser behavior in this test file', () => {
      console.log('\n--- TEMP DEBUG PARSER ---');
      console.log('Typeof parseValueWithSuffix:', typeof parseValueWithSuffix);
      expect(parseValueWithSuffix('2A')).toBe(2);
      expect(parseValueWithSuffix('5')).toBe(5);
      expect(parseValueWithSuffix('10k')).toBe(10000);
      expect(parseValueWithSuffix('0.04W')).toBe(0.04);
      expect(parseValueWithSuffix('20W')).toBe(20);
      expect(parseValueWithSuffix('100mA')).toBe(0.1);
      console.log('--- END TEMP DEBUG ---\n');
    });

    test('validates voltage calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetIR, 'voltage')).toBe(true); 
      expect(validateInputs(validSetIP, 'voltage')).toBe(true); 
      expect(validateInputs(validSetRP, 'voltage')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetI, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetR, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetP, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetNone, 'voltage')).toBe(false);
    });

    test('validates current calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVR, 'current')).toBe(true); 
      expect(validateInputs(validSetVP, 'current')).toBe(true); 
      expect(validateInputs(validSetRP, 'current')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'current')).toBe(false);
      expect(validateInputs(invalidSetI, 'current')).toBe(false);
      expect(validateInputs(invalidSetR, 'current')).toBe(false);
      expect(validateInputs(invalidSetP, 'current')).toBe(false);
      expect(validateInputs(invalidSetNone, 'current')).toBe(false);
    });

    test('validates resistance calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVI, 'resistance')).toBe(true); 
      expect(validateInputs(validSetVP, 'resistance')).toBe(true); 
      expect(validateInputs(validSetIP, 'resistance')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetI, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetR, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetP, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetNone, 'resistance')).toBe(false);
    });

    test('validates power calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVI, 'power')).toBe(true); 
      expect(validateInputs(validSetVR, 'power')).toBe(true); 
      expect(validateInputs(validSetIR, 'power')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'power')).toBe(false);
      expect(validateInputs(invalidSetI, 'power')).toBe(false);
      expect(validateInputs(invalidSetR, 'power')).toBe(false);
      expect(validateInputs(invalidSetP, 'power')).toBe(false);
      expect(validateInputs(invalidSetNone, 'power')).toBe(false);
    });
  });

  // --- calculateOhmsLaw Tests ---
  describe('calculateOhmsLaw', () => {
    test('calculates voltage correctly', () => {
      const values1: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
      const result1 = calculateOhmsLaw(values1, 'voltage');
      
      // Use Number() to ensure we're comparing numbers, not strings
      expect(Number(result1.voltage)).toBeCloseTo(20);
      expect(Number(result1.current)).toBeCloseTo(0.002);
      expect(Number(result1.resistance)).toBeCloseTo(10000);
      expect(Number(result1.power)).toBeCloseTo(0.04);
      expect(result1.calculatedProperty).toBe('voltage');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '', current: '', resistance: '10k', power: '0.04W' };
      const result2 = calculateOhmsLaw(values2, 'voltage');
      expect(Number(result2.voltage)).toBeCloseTo(20);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('voltage');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '', power: '0.04' };
      const result3 = calculateOhmsLaw(values3, 'voltage');
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(Number(result3.resistance)).toBeCloseTo(10000);
      expect(result3.calculatedProperty).toBe('voltage');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates current correctly', () => {
      const values1: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
      const result1 = calculateOhmsLaw(values1, 'current');
      expect(Number(result1.current)).toBeCloseTo(0.012);
      expect(Number(result1.power)).toBeCloseTo(0.144);
      expect(result1.calculatedProperty).toBe('current');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '', current: '', resistance: '1k', power: '0.144W' };
      const result2 = calculateOhmsLaw(values2, 'current');
      expect(Number(result2.current)).toBeCloseTo(0.012);
      expect(Number(result2.voltage)).toBeCloseTo(12);
      expect(result2.calculatedProperty).toBe('current');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '0.144' };
      const result3 = calculateOhmsLaw(values3, 'current');
      expect(Number(result3.current)).toBeCloseTo(0.012);
      expect(Number(result3.resistance)).toBeCloseTo(1000);
      expect(result3.calculatedProperty).toBe('current');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates resistance correctly', () => {
      const values1: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
      const result1 = calculateOhmsLaw(values1, 'resistance');
      expect(Number(result1.resistance)).toBeCloseTo(10000); 
      expect(Number(result1.power)).toBeCloseTo(0.04); 
      expect(result1.calculatedProperty).toBe('resistance');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '20', current: '', resistance: '', power: '0.04W' };
      const result2 = calculateOhmsLaw(values2, 'resistance');
      expect(Number(result2.resistance)).toBeCloseTo(10000);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('resistance');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '', power: '0.04' };
      const result3 = calculateOhmsLaw(values3, 'resistance');
      expect(Number(result3.resistance)).toBeCloseTo(10000);
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(result3.calculatedProperty).toBe('resistance');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates power correctly', () => {
      const values1: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
      const result1 = calculateOhmsLaw(values1, 'power');
      expect(Number(result1.power)).toBeCloseTo(0.04); 
      expect(Number(result1.resistance)).toBeCloseTo(10000);
      expect(result1.calculatedProperty).toBe('power');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '20', current: '', resistance: '10k', power: '' };
      const result2 = calculateOhmsLaw(values2, 'power');
      expect(Number(result2.power)).toBeCloseTo(0.04);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('power');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
      const result3 = calculateOhmsLaw(values3, 'power');
      expect(Number(result3.power)).toBeCloseTo(0.04);
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(result3.calculatedProperty).toBe('power');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('handles current values with A suffix correctly', () => {
      // Create test values with 2A current
      const values: OhmsLawValues = { voltage: '20V', current: '2A', resistance: '', power: '' };
      
      // Calculate resistance using the values
      const result = calculateOhmsLaw(values, 'resistance');
      
      // Check that resistance is calculated correctly (V/I = 20/2 = 10 Ohms)
      expect(Number(result.resistance)).toBeCloseTo(10);
      
      // Check that power is calculated correctly (V*I = 20*2 = 40 Watts)
      expect(Number(result.power)).toBeCloseTo(40);
      
      // Check that the calculated property is set correctly
      expect(result.calculatedProperty).toBe('resistance');
      
      // Check that displayCurrentInMilliamps is false since 2A is not a small current
      expect(result.displayCurrentInMilliamps).toBe(false);
    });

    test('handles current values with mA suffix correctly', () => {
      const values: OhmsLawValues = { voltage: '12V', current: '', resistance: '1.2k', power: '' };
      const result = calculateOhmsLaw(values, 'current');
      expect(Number(result.current)).toBeCloseTo(0.01); 
      expect(result.displayCurrentInMilliamps).toBe(true);
      expect(result.calculatedProperty).toBe('current');
    });

    test('handles power values correctly', () => {
      const values: OhmsLawValues = { voltage: '10', current: '', resistance: '100', power: '' };
      const result = calculateOhmsLaw(values, 'power');
      expect(Number(result.power)).toBeCloseTo(1);
      expect(Number(result.current)).toBeCloseTo(0.1);
      expect(result.calculatedProperty).toBe('power');
      expect(result.displayCurrentInMilliamps).toBe(false); 
    });

    test('handles insufficient data', () => {
      const values: OhmsLawValues = { voltage: '10', current: '', resistance: '', power: '' };
      const result = calculateOhmsLaw(values, 'resistance');
      expect(result.calculatedProperty).toBeNull();
      expect(result.description).toContain('Insufficient data');
      expect(result.resistance).toBe('');
      expect(result.voltage).toBe('10');
    });
  }); 
});
````

## File: tests/lib/utils/ohmsLawUtils.test.ts
````typescript
import { calculateOhmsLaw, validateInputs } from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils';
import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator/index';

describe('Ohm\'s Law Utilities', () => {
  describe('validateInputs', () => {
    test('validates voltage calculation inputs', () => {
      // Current and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '2A', // 2A
        resistance: '10',
        power: ''
      }, 'voltage')).toBe(true);
      
      // Power and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: '40',
      }, 'voltage')).toBe(true);
      
      // Power and current provided
      expect(validateInputs({
        voltage: '',
        current: '2A', // 2A
        resistance: '',
        power: '40', // 40W
      }, 'voltage')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: ''
      }, 'voltage')).toBe(false);
    });
    
    test('validates current calculation inputs', () => {
      // Voltage and resistance provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      }, 'current')).toBe(true);
      
      // Power and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: '40', // 40W
      }, 'current')).toBe(true);
      
      // Power and voltage provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: '40', // 40W
      }, 'current')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'current')).toBe(false);
    });
    
    test('validates resistance calculation inputs', () => {
      // Voltage and current provided
      expect(validateInputs({
        voltage: '20',
        current: '2A', // 2A
        resistance: '',
        power: ''
      }, 'resistance')).toBe(true);
      
      // Voltage and power provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: '40', // 40W
      }, 'resistance')).toBe(true);
      
      // Power and current provided
      expect(validateInputs({
        voltage: '',
        current: '2A', // 2A
        resistance: '',
        power: '40', // 40W
      }, 'resistance')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'resistance')).toBe(false);
    });
    
    test('validates power calculation inputs', () => {
      // Voltage and current provided
      expect(validateInputs({
        voltage: '20',
        current: '2A', // 2A
        resistance: '',
        power: ''
      }, 'power')).toBe(true);
      
      // Current and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '2A', // 2A
        resistance: '10',
        power: ''
      }, 'power')).toBe(true);
      
      // Voltage and resistance provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      }, 'power')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'power')).toBe(false);
    });
  });
  
  describe('calculateOhmsLaw', () => {
    test('calculates voltage correctly', () => {
      // Using current and resistance (V = I × R)
      const values: OhmsLawValues = {
        voltage: '',
        current: '2A', // Changed from '2000' to '2A' to match intent (2 Amps)
        resistance: '10',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'voltage');
      expect(parseFloat(result.voltage)).toBeCloseTo(20);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('voltage');
    });
    
    test('calculates current correctly', () => {
      // Using voltage and resistance (I = V / R)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'current');
      // Result will be in amps, but we need to check the string value
      // which might be formatted differently
      expect(parseFloat(result.current)).toBeCloseTo(2);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('current');
    });
    
    test('calculates resistance correctly', () => {
      // Using voltage and current (R = V / I)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2A', // Changed from '2000' to '2A' to match intent (2 Amps)
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('resistance');
    });
    
    test('calculates power correctly', () => {
      // Using voltage and current (P = V × I)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2A', // Changed from '2000' to '2A' to match intent (2 Amps)
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'power');
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('power');
    });
    
    test('handles current values with A suffix correctly', () => {
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2A', // Explicitly in amps
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
    });
    
    test('handles current values with mA suffix correctly', () => {
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2000mA', // Explicitly in milliamps
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
    });
    
    test('handles power values correctly', () => {
      // Test with plain number (treated as mW)
      const values1: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: '40000' // 40000mW = 40W
      };
      
      const result1 = calculateOhmsLaw(values1, 'current');
      expect(parseFloat(result1.current)).toBeCloseTo(2);
      
      // Test with W suffix
      const values2: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: '40W' // 40W
      };
      
      const result2 = calculateOhmsLaw(values2, 'current');
      expect(parseFloat(result2.current)).toBeCloseTo(2);
    });
  });
});
````

## File: tests/lib/utils/parseValueWithSuffix.test.ts
````typescript
import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('parseValueWithSuffix', () => {
  test('parses basic numbers correctly', () => {
    expect(parseValueWithSuffix('5')).toBe(5);
    expect(parseValueWithSuffix('10')).toBe(10);
    expect(parseValueWithSuffix('0.5')).toBe(0.5);
    expect(parseValueWithSuffix('-10')).toBe(-10);
  });

  test('parses values with kilo (k/K) suffix correctly', () => {
    expect(parseValueWithSuffix('5k')).toBe(5000);
    expect(parseValueWithSuffix('2.5K')).toBe(2500);
    expect(parseValueWithSuffix('10kΩ')).toBe(10000);
  });

  test('parses values with mega (M) suffix correctly', () => {
    expect(parseValueWithSuffix('1M')).toBe(1000000);
    expect(parseValueWithSuffix('2.2M')).toBe(2200000);
    expect(parseValueWithSuffix('0.5MΩ')).toBe(500000);
  });

  test('parses values with milli (m) suffix correctly', () => {
    expect(parseValueWithSuffix('5m')).toBe(0.005);
    expect(parseValueWithSuffix('100m')).toBe(0.1);
    expect(parseValueWithSuffix('2.5mV')).toBe(0.0025);
  });

  test('parses values with micro (u/µ) suffix correctly', () => {
    expect(parseValueWithSuffix('10u')).toBe(0.00001);
    expect(parseValueWithSuffix('50µ')).toBe(0.00005);
    expect(parseValueWithSuffix('100uV')).toBe(0.0001);
  });

  test('parses values with giga (G) suffix correctly', () => {
    expect(parseValueWithSuffix('1G')).toBe(1000000000);
    expect(parseValueWithSuffix('2.5G')).toBe(2500000000);
  });

  test('parses values with unit symbols correctly', () => {
    expect(parseValueWithSuffix('5V')).toBe(5);
    expect(parseValueWithSuffix('10Ω')).toBe(10);
    expect(parseValueWithSuffix('20W')).toBe(20);
  });

  test('parses milliamps (mA) correctly', () => {
    expect(parseValueWithSuffix('100mA')).toBe(0.1);
    expect(parseValueWithSuffix('5ma')).toBe(0.005);
    expect(parseValueWithSuffix('2.5mA')).toBe(0.0025);
  });

  test('handles empty or invalid inputs', () => {
    expect(parseValueWithSuffix('')).toBe(0);
    expect(parseValueWithSuffix('   ')).toBe(0);
    expect(parseValueWithSuffix('abc')).toBe(0);
  });
});
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
# Node modules
/node_modules/

# Production build output
/.next/
/out/
/build/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS generated files
.DS_Store
Thumbs.db

# Local environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln

# Build artifacts
dist/
*.log

# Optional: if using coverage tool
coverage/

# Mac-specific files
.AppleDouble
.LSOverride

# Exclude static exports that are deployed
/static-export/
````

## File: .windsurfrules
````
- Do not create folders or files if they already exist.
- Follow existing project structure and conventions.
- Always review and understand the current directory structure before making changes.
- Code should be modular, reusable, and minimal — avoid duplication.
- Prefer functional components and hooks over class components.
- Do not create scripts or code that automates shell commands unless explicitly requested.

- Follow established project linting and formatting rules (Prettier, ESLint, etc.).
- Use TypeScript types and interfaces where appropriate for clarity and safety.
- Use environment variables for configuration — never hardcode sensitive data.
- Keep components and functions small — single-responsibility principle.

- Do not make large changes to code that is passing tests unless explicitly instructed.
- When modifying a feature:
  - Only touch what is necessary.
  - Leave unrelated code untouched.
- Preserve existing code comments, structure, and naming unless directed otherwise.

- All tests must pass before and after making changes.
- Add new tests for new functionality or changes to critical logic.
- Do not remove tests unless instructed.

- Use semantic HTML.
- Ensure basic accessibility (alt text for images, proper heading levels, labels for inputs).
- Avoid introducing UI changes without context or approval.


- Remember: The goal is to augment a human developer workflow — not overwrite decisions or force major structural changes without discussion.
- This is a client side github pages project do not use serverside code.
````

## File: eslint.config.mjs
````
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
````

## File: jest-results.json
````json
{"numFailedTestSuites":1,"numFailedTests":3,"numPassedTestSuites":5,"numPassedTests":37,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":6,"numTotalTests":40,"openHandles":[],"snapshot":{"added":0,"didUpdate":false,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0},"startTime":1744557557642,"success":false,"testResults":[{"assertionResults":[{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates voltage calculation inputs","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"validates voltage calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates current calculation inputs","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"validates current calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates resistance calculation inputs","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"validates resistance calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates power calculation inputs","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"validates power calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":2,"failureDetails":[{"matcherResult":{"message":"\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m20\u001b[39m\nReceived: \u001b[31m20000\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m19980\u001b[39m","pass":false}}],"failureMessages":["Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m20\u001b[39m\nReceived: \u001b[31m20000\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m19980\u001b[39m\n    at Object.<anonymous> (D:\\battlewithbytes.io\\tests\\lib\\utils\\ohmsLawUtils.test.ts:154:42)\n    at Promise.then.completed (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:231:10)\n    at _callCircusTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:316:40)\n    at _runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:252:3)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:126:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at run (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:71:3)\n    at runAndTransformResultsToJestFormat (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapterInit.js:122:21)\n    at jestAdapter (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapter.js:79:19)\n    at runTestInternal (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:367:16)\n    at runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:444:34)"],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates voltage correctly","invocations":1,"location":null,"numPassingAsserts":0,"retryReasons":[],"status":"failed","title":"calculates voltage correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates current correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"calculates current correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[{"matcherResult":{"message":"\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m10\u001b[39m\nReceived: \u001b[31m0.01\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m9.99\u001b[39m","pass":false}}],"failureMessages":["Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m10\u001b[39m\nReceived: \u001b[31m0.01\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m9.99\u001b[39m\n    at Object.<anonymous> (D:\\battlewithbytes.io\\tests\\lib\\utils\\ohmsLawUtils.test.ts:186:45)\n    at Promise.then.completed (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:231:10)\n    at _callCircusTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:316:40)\n    at _runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:252:3)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:126:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at run (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:71:3)\n    at runAndTransformResultsToJestFormat (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapterInit.js:122:21)\n    at jestAdapter (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapter.js:79:19)\n    at runTestInternal (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:367:16)\n    at runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:444:34)"],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates resistance correctly","invocations":1,"location":null,"numPassingAsserts":0,"retryReasons":[],"status":"failed","title":"calculates resistance correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[{"matcherResult":{"message":"\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m40\u001b[39m\nReceived: \u001b[31m40000\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m39960\u001b[39m","pass":false}}],"failureMessages":["Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected: \u001b[32m40\u001b[39m\nReceived: \u001b[31m40000\u001b[39m\n\nExpected precision:    2\nExpected difference: < \u001b[32m0.005\u001b[39m\nReceived difference:   \u001b[31m39960\u001b[39m\n    at Object.<anonymous> (D:\\battlewithbytes.io\\tests\\lib\\utils\\ohmsLawUtils.test.ts:201:40)\n    at Promise.then.completed (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\utils.js:231:10)\n    at _callCircusTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:316:40)\n    at _runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:252:3)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:126:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at _runTestsForDescribeBlock (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:121:9)\n    at run (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\run.js:71:3)\n    at runAndTransformResultsToJestFormat (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapterInit.js:122:21)\n    at jestAdapter (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-circus@29.7.0\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapter.js:79:19)\n    at runTestInternal (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:367:16)\n    at runTest (D:\\battlewithbytes.io\\node_modules\\.pnpm\\jest-runner@29.7.0\\node_modules\\jest-runner\\build\\runTest.js:444:34)"],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates power correctly","invocations":1,"location":null,"numPassingAsserts":0,"retryReasons":[],"status":"failed","title":"calculates power correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles current values with A suffix correctly","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"handles current values with A suffix correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles current values with mA suffix correctly","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"handles current values with mA suffix correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles power values correctly","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"handles power values correctly"}],"endTime":1744557558269,"message":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mOhm's Law Utilities › calculateOhmsLaw › calculates voltage correctly\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected: \u001b[32m20\u001b[39m\n    Received: \u001b[31m20000\u001b[39m\n\n    Expected precision:    2\n    Expected difference: < \u001b[32m0.005\u001b[39m\n    Received difference:   \u001b[31m19980\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 152 |\u001b[39m       \u001b[22m\n\u001b[2m     \u001b[90m 153 |\u001b[39m       \u001b[36mconst\u001b[39m result \u001b[33m=\u001b[39m calculateOhmsLaw(values\u001b[33m,\u001b[39m \u001b[32m'voltage'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 154 |\u001b[39m       expect(parseFloat(result\u001b[33m.\u001b[39mvoltage))\u001b[33m.\u001b[39mtoBeCloseTo(\u001b[35m20\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                          \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 155 |\u001b[39m       expect(parseFloat(result\u001b[33m.\u001b[39mpower))\u001b[33m.\u001b[39mtoBeCloseTo(\u001b[35m40\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 156 |\u001b[39m       expect(result\u001b[33m.\u001b[39mcalculatedProperty)\u001b[33m.\u001b[39mtoBe(\u001b[32m'voltage'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 157 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/lib/utils/ohmsLawUtils.test.ts\u001b[39m\u001b[0m\u001b[2m:154:42)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mOhm's Law Utilities › calculateOhmsLaw › calculates resistance correctly\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected: \u001b[32m10\u001b[39m\n    Received: \u001b[31m0.01\u001b[39m\n\n    Expected precision:    2\n    Expected difference: < \u001b[32m0.005\u001b[39m\n    Received difference:   \u001b[31m9.99\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 184 |\u001b[39m       \u001b[22m\n\u001b[2m     \u001b[90m 185 |\u001b[39m       \u001b[36mconst\u001b[39m result \u001b[33m=\u001b[39m calculateOhmsLaw(values\u001b[33m,\u001b[39m \u001b[32m'resistance'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 186 |\u001b[39m       expect(parseFloat(result\u001b[33m.\u001b[39mresistance))\u001b[33m.\u001b[39mtoBeCloseTo(\u001b[35m10\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                             \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 187 |\u001b[39m       expect(parseFloat(result\u001b[33m.\u001b[39mpower))\u001b[33m.\u001b[39mtoBeCloseTo(\u001b[35m40\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 188 |\u001b[39m       expect(result\u001b[33m.\u001b[39mcalculatedProperty)\u001b[33m.\u001b[39mtoBe(\u001b[32m'resistance'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 189 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/lib/utils/ohmsLawUtils.test.ts\u001b[39m\u001b[0m\u001b[2m:186:45)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mOhm's Law Utilities › calculateOhmsLaw › calculates power correctly\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBeCloseTo\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected: \u001b[32m40\u001b[39m\n    Received: \u001b[31m40000\u001b[39m\n\n    Expected precision:    2\n    Expected difference: < \u001b[32m0.005\u001b[39m\n    Received difference:   \u001b[31m39960\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 199 |\u001b[39m       \u001b[22m\n\u001b[2m     \u001b[90m 200 |\u001b[39m       \u001b[36mconst\u001b[39m result \u001b[33m=\u001b[39m calculateOhmsLaw(values\u001b[33m,\u001b[39m \u001b[32m'power'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 201 |\u001b[39m       expect(parseFloat(result\u001b[33m.\u001b[39mpower))\u001b[33m.\u001b[39mtoBeCloseTo(\u001b[35m40\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                        \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 202 |\u001b[39m       expect(result\u001b[33m.\u001b[39mcalculatedProperty)\u001b[33m.\u001b[39mtoBe(\u001b[32m'power'\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 203 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 204 |\u001b[39m     \u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/lib/utils/ohmsLawUtils.test.ts\u001b[39m\u001b[0m\u001b[2m:201:40)\u001b[22m\u001b[2m\u001b[22m\n","name":"D:\\battlewithbytes.io\\tests\\lib\\utils\\ohmsLawUtils.test.ts","startTime":1744557557924,"status":"failed","summary":""},{"assertionResults":[{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":15,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs TEMP DEBUG: parser behavior in this test file","invocations":1,"location":null,"numPassingAsserts":6,"retryReasons":[],"status":"passed","title":"TEMP DEBUG: parser behavior in this test file"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates voltage calculation inputs","invocations":1,"location":null,"numPassingAsserts":8,"retryReasons":[],"status":"passed","title":"validates voltage calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates current calculation inputs","invocations":1,"location":null,"numPassingAsserts":8,"retryReasons":[],"status":"passed","title":"validates current calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":6,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates resistance calculation inputs","invocations":1,"location":null,"numPassingAsserts":8,"retryReasons":[],"status":"passed","title":"validates resistance calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","validateInputs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities validateInputs validates power calculation inputs","invocations":1,"location":null,"numPassingAsserts":8,"retryReasons":[],"status":"passed","title":"validates power calculation inputs"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates voltage correctly","invocations":1,"location":null,"numPassingAsserts":14,"retryReasons":[],"status":"passed","title":"calculates voltage correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates current correctly","invocations":1,"location":null,"numPassingAsserts":12,"retryReasons":[],"status":"passed","title":"calculates current correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates resistance correctly","invocations":1,"location":null,"numPassingAsserts":12,"retryReasons":[],"status":"passed","title":"calculates resistance correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw calculates power correctly","invocations":1,"location":null,"numPassingAsserts":12,"retryReasons":[],"status":"passed","title":"calculates power correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles current values with A suffix correctly","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"handles current values with A suffix correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles current values with mA suffix correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"handles current values with mA suffix correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles power values correctly","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"handles power values correctly"},{"ancestorTitles":["Ohm's Law Utilities","calculateOhmsLaw"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Ohm's Law Utilities calculateOhmsLaw handles insufficient data","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"handles insufficient data"}],"endTime":1744557558385,"message":"","name":"D:\\battlewithbytes.io\\tests\\lib\\utils\\inputUtils.test.ts","startTime":1744557558300,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["parseValueWithSuffix"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses basic numbers correctly","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"parses basic numbers correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with kilo (k/K) suffix correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses values with kilo (k/K) suffix correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with mega (M) suffix correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses values with mega (M) suffix correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with milli (m) suffix correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses values with milli (m) suffix correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with micro (u/µ) suffix correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses values with micro (u/µ) suffix correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with giga (G) suffix correctly","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"parses values with giga (G) suffix correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses values with unit symbols correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses values with unit symbols correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix parses milliamps (mA) correctly","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"parses milliamps (mA) correctly"},{"ancestorTitles":["parseValueWithSuffix"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"parseValueWithSuffix handles empty or invalid inputs","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"handles empty or invalid inputs"}],"endTime":1744557558492,"message":"","name":"D:\\battlewithbytes.io\\tests\\lib\\utils\\parseValueWithSuffix.test.ts","startTime":1744557558433,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["Debug parseValueWithSuffix"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"Debug parseValueWithSuffix debug actual behavior","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"debug actual behavior"}],"endTime":1744557558577,"message":"","name":"D:\\battlewithbytes.io\\tests\\lib\\utils\\debug-parser.test.ts","startTime":1744557558521,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["Battle With Bytes Blog System","Blog Structure"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Battle With Bytes Blog System Blog Structure should have the correct blog directory structure","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"should have the correct blog directory structure"},{"ancestorTitles":["Battle With Bytes Blog System","Blog Structure"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Battle With Bytes Blog System Blog Structure should have at least one blog post","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"should have at least one blog post"},{"ancestorTitles":["Battle With Bytes Blog System","Blog Post Format"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Battle With Bytes Blog System Blog Post Format should have index.mdx and meta.txt files","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"should have index.mdx and meta.txt files"},{"ancestorTitles":["Battle With Bytes Blog System","Blog Post Format"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"Battle With Bytes Blog System Blog Post Format should have properly formatted meta.txt file","invocations":1,"location":null,"numPassingAsserts":5,"retryReasons":[],"status":"passed","title":"should have properly formatted meta.txt file"},{"ancestorTitles":["Battle With Bytes Blog System","Blog Post Format"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"Battle With Bytes Blog System Blog Post Format should have properly formatted index.mdx file without frontmatter","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"should have properly formatted index.mdx file without frontmatter"}],"endTime":1744557558665,"message":"","name":"D:\\battlewithbytes.io\\tests\\blog\\blog-system.test.js","startTime":1744557558609,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["Detailed Debug Tests"],"duration":4,"failureDetails":[],"failureMessages":[],"fullName":"Detailed Debug Tests debug calculateOhmsLaw behavior","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"debug calculateOhmsLaw behavior"}],"endTime":1744557558749,"message":"","name":"D:\\battlewithbytes.io\\tests\\lib\\utils\\detailed-debug.test.ts","startTime":1744557558696,"status":"passed","summary":""}],"wasInterrupted":false}
````

## File: jest.config.js
````javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/**/*.test.(ts|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
````

## File: mdx-components.tsx
````typescript
import RadixTabs from './src/components/RadixTabs';
import ImageWidget from './src/components/ImageWidget';
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    RadixTabs,
    ImageWidget,
    ...components,
  };
}
````

## File: next.config.js
````javascript
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// In production, don't use paths for custom domain
const isUsingCustomDomain = true; // Set to true since you're using battlewithbytes.io

const nextConfig = {
  output: 'export',
  // Only use basePath and assetPrefix if NOT using a custom domain and in production
  basePath: isProd && !isUsingCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isUsingCustomDomain ? '/battlewithbytes.io/' : '',
  reactStrictMode: false,
  images: {
    unoptimized: true, // Stays true for static export compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.flux.ai',
        port: '',
        pathname: '/static/media/**',
      },
    ],
  },
  // Your other Next.js configurations can go here
};

module.exports = nextConfig;
````

## File: next.config.ts
````typescript
import type { NextConfig } from 'next'
import remarkGfm from 'remark-gfm'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => { 
    // Transpile react-console-emulator package
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules[\\/]react-console-emulator/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        },
      },
    })
    
    // Disable webpack cache in development (merged from next.config.js)
    if (dev) {
      config.cache = false;
    }

    return config
  },
}

export default nextConfig
````

## File: notes.txt
````
<InteractiveCodeBlock 
  githubUrl="https://github.com/rockowitz/ddcutil/blob/master/src/public/ddcutil_types.h#L339-L357"
  language="c"
  showLineNumbers={true}
  highlights={[
    { text: "DDCA_INPUT_SOURCE", color: "#00ff9d", tooltip: "VCP code 60h - Input Source Selection" },
    { text: "DDCA_IMAGE_ORIENTATION", color: "#ff851b", tooltip: "VCP code AAh - Image Rotation" }
  ]}
/>


how you do the code blocks
````

## File: package.json
````json
{
  "name": "battlewithbytes.io",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/generate-blog-data.js && next dev",
    "prebuild": "node scripts/generate-blog-data.js && node scripts/generate-rss.js",
    "build": "next build",
    "export": "next export",
    "build:static": "next build",
    "start": "next start",
    "predeploy": "pnpm run build:static",
    "deploy": "gh-pages -d out",
    "blog": "node scripts/blog-manager.js",
    "project": "node scripts/project-manager.js",
    "test": "jest"
  },
  "dependencies": {
    "@babel/runtime": "^7.27.0",
    "@headlessui/react": "^2.2.2",
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@radix-ui/react-tabs": "^1.1.4",
    "@types/lodash.debounce": "^4.0.9",
    "@types/nodemailer": "^6.4.17",
    "@types/prismjs": "^1.26.5",
    "classnames": "^2.5.1",
    "date-fns": "^3.3.1",
    "dom-to-image-more": "^3.6.0",
    "esprima": "4.0.1",
    "framer-motion": "^12.11.0",
    "gh-pages": "^6.3.0",
    "gray-matter": "^4.0.3",
    "immer": "^10.1.1",
    "jspdf": "^3.0.1",
    "lodash.debounce": "^4.0.8",
    "nanoid": "^5.1.5",
    "next": "15.3.0",
    "next-mdx-remote": "^5.0.0",
    "nodemailer": "^6.10.0",
    "prismjs": "^1.30.0",
    "react": "^19.0.0",
    "react-console-emulator": "^5.0.2",
    "react-dom": "^19.0.0",
    "react-embed-gist": "^1.0.29",
    "reactflow": "^11.11.4",
    "recharts": "^2.15.2",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-prism-plus": "^2.0.1",
    "rehype-sanitize": "^6.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-stringify": "^10.0.1",
    "remark": "^15.0.1",
    "remark-gfm": "^4.0.1",
    "remark-html": "^16.0.1",
    "zustand": "^5.0.4"
  },
  "homepage": "https://ril3y.github.io/battlewithbytes.io",
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.1.3",
    "@tailwindcss/typography": "^0.5.16",
    "@types/jest": "^29.5.14",
    "@types/mdx": "^2.0.13",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-loader": "^10.0.0",
    "chalk": "^4.1.2",
    "commander": "^13.1.0",
    "cross-env": "^7.0.3",
    "eslint": "^9",
    "eslint-config-next": "15.3.0",
    "jest": "^29.7.0",
    "rss": "^1.2.2",
    "tailwindcss": "^4",
    "ts-jest": "^29.3.1",
    "typescript": "^5"
  }
}
````

## File: postcss.config.mjs
````
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
````

## File: README.md
````markdown
# Battle With Bytes

A modern, cyber-hacker themed personal website focused on cybersecurity, embedded hardware, and software engineering. Built with Next.js, featuring a professional dark theme, neon green accents, terminal-inspired design, and a modular, extensible content structure.

---

## 🚀 Features

- **Cyberpunk Aesthetic:** Dark background, neon green/blue/purple accents, monospace fonts, and terminal-inspired UI.
- **QuakeTerminal:** Drop-down terminal activated by pressing `~`.
- **Home, Blog, Tools, Projects, About:** Modular sections for all your content.
- **SEO Optimized:** Centralized SEO utilities, OpenGraph, JSON-LD, sitemap, robots.txt.
- **MDX Content:** Blogs and projects written in MDX with rich frontmatter.
- **Custom Tools:** Interactive calculators and engineering tools with a cohesive UI.
- **Fully Client-side:** Designed for GitHub Pages/static export—no server-side code.
- **Automated Content Management:** Scripts for creating, updating, and managing blog posts and projects.

---

## 🗂️ Directory Structure

```
├── public/
│   └── images/
│       ├── blog/
│       └── projects/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── content/
│   │   ├── blog/         # Blog posts (MDX)
│   │   └── projects/     # Projects (MDX)
│   └── lib/utils/seo.ts  # SEO utilities
├── scripts/              # Content management scripts
│   ├── blog-manager.js
│   ├── create-blog-post.js
│   ├── project-manager.js
│   └── ...
├── package.json
├── README.md
└── ...
```

---

## ⚡ Getting Started

### 1. **Install Dependencies**
```sh
pnpm install
```

### 2. **Run the Development Server**
```sh
pnpm dev
```
- Open [http://localhost:3000](http://localhost:3000) to view your site.

### 3. **Build for Production**
```sh
pnpm build
```

### 4. **Export Static Site**
```sh
pnpm export
```

### 5. **Deploy to GitHub Pages**
```sh
pnpm deploy
```

---

## 📝 Content Management Scripts

### **Blog Management**
- **Interactive Blog Manager:**
  ```sh
  pnpm blog
  ```
  - List, create, update, or delete blog posts interactively.
- **Create Blog Post (Quick):**
  ```sh
  node scripts/create-blog-post.js
  ```
  - Guided prompts for title, slug, excerpt, tags, etc.

### **Project Management**
- **Interactive Project Manager:**
  ```sh
  pnpm project
  ```
  - List, create, update, delete, enable, or disable projects interactively.

### **Other Scripts**
- **generate-blog-data.js:** Generates blog data for static export.
- **deploy-gh-pages.js:** Deploys the site to GitHub Pages.

---

## ✍️ Writing Content (Blog & Projects)

- **Blog posts:** Place MDX files in `src/content/blog/[slug]/index.mdx`.
- **Projects:** Place MDX files in `src/content/projects/[slug]/index.mdx`.
- **Frontmatter Example:**
  ```md
  ---
  title: "Your Title"
  date: "2025-04-17"
  excerpt: "Short summary of your post or project."
  tags: ["tag1", "tag2"]
  author: "Battle With Bytes"
  enabled: true
  ---
  
  Your content goes here...
  ```
- **Images:** Place in `public/images/blog/[slug]/` or `public/images/projects/[slug]/`.
- **Cover Images:** Reference as `/images/blog/[slug]/cover.png` or `/images/projects/[slug]/cover.png`.

---

## 🎨 Design & Aesthetic

- **Theme:** Dark, high-contrast, neon-accented cyberpunk.
- **Fonts:** Monospace (Geist Mono), modern sans (Geist Sans).
- **Terminal UI:** Includes a drop-down QuakeTerminal and terminal-inspired elements.
- **Accessibility:** Semantic HTML, alt text for images, keyboard navigation.

---

## 🔒 Security & Best Practices

- No server-side code—fully static and safe for GitHub Pages.
- Follows Next.js, ESLint, and Prettier conventions.
- Sensitive data should always use environment variables (never hardcoded).
- All interactive elements use best practices for accessibility and security.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15+
- **Languages:** TypeScript, JavaScript, MDX
- **Styling:** Tailwind CSS, Custom CSS
- **Content:** MDX, Markdown
- **Deployment:** GitHub Pages, gh-pages
- **SEO:** OpenGraph, JSON-LD, sitemap.xml, robots.txt

---

## 🧑‍💻 Developer Notes

- **Scripts:** All content management is handled via interactive scripts (`pnpm blog`, `pnpm project`).
- **Image Optimization:** Optimize images manually or with VS Code extensions before placing in `public/images`.
- **Testing:** Run `pnpm test` to ensure all tests pass before deploying.
- **Customization:** Update theme colors, accent variables, and fonts in `src/app/globals.css`.
- **Adding Tools:** Place new calculators or utilities in `src/components/tools/` and register them in the Tools page.

---

## 🤝 Contributing & Feedback

- Pull requests are welcome!
- For feature requests or bug reports, open an issue on GitHub.

---

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Pages](https://pages.github.com/)

---

> _Battle With Bytes: A hub for hackers, makers, and engineers._
````

## File: smtp-config-example.txt
````
# SMTP Configuration for Contact Form
# Copy these variables to your .env.local file

# SMTP Server Settings
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Authentication
SMTP_USER=your-smtp-username@yourdomain.com
SMTP_PASSWORD=your-smtp-password

# Set this to true to enable email sending in development mode (be careful!)
ENABLE_EMAIL_IN_DEV=false
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "src"],
  "exclude": ["node_modules"]
}
````

## File: vision.md
````markdown
# Battle With Bytes - High-Level Design PRD

## 1. Vision & Purpose

**Battle With Bytes** is a personal hub for sharing insights on cybersecurity, embedded hardware, and software engineering through a diverse mix of content.
**Tagline:** _Ask me about little data._
**Primary Goals:**
- Provide a platform for high-quality, technical blog entries.
- Host multiple single page applications (SPAs), including engineering calculators (e.g., a MOSFET power calculator).
- Create an engaging, hacker-inspired user experience while keeping things minimal and functional.

## 2. Goals & Objectives

- **Content Hub:**  
  - **Blogs:** Create a dynamic blog system where each blog post is authored in Markdown (or MDX) and automatically rendered by Next.js.
  - **Technical Write-Ups:** Include posts on topics like embedded development, cybersecurity, and reverse engineering.

- **Tool Integration:**  
  - **Single Page Applications (SPAs):**  
    - Host independent tools such as a MOSFET calculator.
    - Explore converting existing React.js SPAs into the Next.js ecosystem (as submodules or micro frontends).
  - **Modular Architecture:**  
    - Enable easy addition and maintenance of diverse tools and applications, ensuring each tool is self-contained but integrated under the unified site theme.

- **Deployment & Hosting:**  
  - Leverage GitHub Pages for hosting the static build.
  - Use Next.js export mode for static site generation.
  - Map the custom domain [battlewithbytes.io](https://battlewithbytes.io).

## 3. Technical Approach

### 3.1 Framework & Tooling

- **Next.js (with TypeScript & TailwindCSS):**
  - Build the core site with Next.js using an `app/` directory structure.
  - Set up static site generation (`output: 'export'`) for GitHub Pages compatibility.

- **MDX for Blog Posts:**
  - Enable MDX to write rich Markdown-based blog entries.
  - Organize posts in a dedicated directory (e.g., `src/content/blog`).

- **Single Page Applications:**
  - Integrate tools (e.g., MOSFET calculator) as:
    - **Converted Components:** Rewrite or adapt React.js components to Next.js.
    - **Submodule/iframe Approach:** Temporarily embed the existing tool as an isolated submodule with a dedicated route (e.g., `src/app/tools/mosfet`).

### 3.2 Project Structure

```
/battlewithbytes.io
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage with branding & overview
│   │   ├── blog/                 # Blog routes (index, [slug].tsx)
│   │   ├── tools/                # Tools & calculators routes
│   │   ├── about/                # About/Bio page
│   │   ├── projects/             # Project showcases
│   │   └── uses/                 # Stack, tools, and hardware/software list
│   ├── content/
│   │   └── blog/                 # Blog posts written in MDX
│   └── styles/                   # Tailwind and custom CSS styles
├── next.config.ts                # Next.js configuration for static export & MDX
├── package.json
└── tailwind.config.ts            # Tailwind configuration with custom hacker theme
```

### 3.3 Deployment

- **GitHub Pages Deployment:**
  - Use `next export` to generate a static site.
  - Automate deployment using a script (via `gh-pages`) in the package.json:
    ```json
    "scripts": {
      "build": "next build",
      "export": "next export",
      "deploy": "pnpm build && pnpm export && gh-pages -d out"
    }
    ```
- **Custom Domain Setup:**  
  - Update DNS settings to point `battlewithbytes.io` to GitHub Pages.
  - Configure a CNAME file in the static export folder if necessary.

## 4. Considerations & Open Questions

- **Blog System:**
  - Should blog posts be integrated directly in Next.js or managed via a headless CMS?
  - Evaluate pros/cons: Direct Markdown files are simple but may need additional features (e.g., tagging, search).

- **Tool Integration:**
  - Is the MOSFET calculator best rewritten in Next.js, or can we embed it via an iframe?
  - Assess if other tools warrant standalone conversion or if they can be managed as isolated submodules.

- **Maintenance & Scalability:**
  - Ensure the site structure supports future expansion (additional SPAs, new blog categories, etc.).
  - Keep the codebase modular to allow for easy updates and integration of new features.

## 5. Next Steps

1. **Initialize Project Structure:**  
   Set up directories and required configuration as outlined.

2. **Set Up MDX & Tailwind:**  
   Configure Next.js for MDX for blog posts and establish a custom Tailwind theme.

3. **Convert/Integrate Tools:**  
   Decide on converting the MOSFET calculator and configure it within the `/tools` route.

4. **Deploy & Test:**  
   Perform a full build, deploy to GitHub Pages, and test the site using your domain.

5. **Iterate on Content & Features:**  
   Start adding blog posts, tool demos, and iterate based on feedback.

*End of PRD*
````
