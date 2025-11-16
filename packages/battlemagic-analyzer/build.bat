@echo off
REM BattleMagic Analyzer Build Script for Windows
REM Builds the Rust WASM module with optimal settings

echo Building BattleMagic Binary Analyzer...

REM Check if wasm-pack is installed
where wasm-pack >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: wasm-pack not found. Install with: cargo install wasm-pack
    exit /b 1
)

REM Determine build mode
set BUILD_MODE=%1
if "%BUILD_MODE%"=="" set BUILD_MODE=release

if "%BUILD_MODE%"=="dev" (
    echo Building in development mode (fast compilation)...
    wasm-pack build --dev --target web
) else (
    echo Building in release mode (optimized)...
    wasm-pack build --release --target web

    REM Optional: Further optimize with wasm-opt if available
    where wasm-opt >nul 2>nul
    if %errorlevel% equ 0 (
        echo Running wasm-opt for additional size reduction...
        wasm-opt -Oz -o pkg\battlemagic_analyzer_bg_opt.wasm pkg\battlemagic_analyzer_bg.wasm
        move /y pkg\battlemagic_analyzer_bg_opt.wasm pkg\battlemagic_analyzer_bg.wasm
    )
)

echo.
echo Build complete! Output in pkg\ directory
echo.
echo File sizes:
dir pkg\*.wasm
echo.
echo To use in your project:
echo   npm install ../../packages/battlemagic-analyzer/pkg
