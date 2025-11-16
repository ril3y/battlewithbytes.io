@echo off
REM BattleMagic Analyzer - Test Runner (Windows)
REM Runs all tests for the WASM module

echo ========================================
echo BattleMagic Analyzer - Test Suite
echo ========================================
echo.

REM Check if cargo is installed
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Cargo not found. Please install Rust.
    exit /b 1
)

REM 1. Run Rust unit tests
echo [1/5] Running Rust unit tests...
echo ----------------------------------------
cargo test --lib
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Rust unit tests failed
    exit /b 1
)
echo.

REM 2. Run Rust integration tests
echo [2/5] Running Rust integration tests...
echo ----------------------------------------
cargo test --test integration_test
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Rust integration tests failed
    exit /b 1
)
echo.

REM 3. Build WASM module
echo [3/5] Building WASM module...
echo ----------------------------------------
call build.bat
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: WASM build failed
    exit /b 1
)
echo.

REM 4. Run Node.js tests (if pkg directory exists)
if exist pkg\package.json (
    echo [4/5] Running Node.js tests...
    echo ----------------------------------------
    node test-node.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Node.js tests failed
        exit /b 1
    )
    echo.
) else (
    echo [4/5] Skipping Node.js tests (pkg not built)
    echo.
)

REM 5. Run standalone test binary with sample data
echo [5/5] Running standalone binary tests...
echo ----------------------------------------
if exist test-data\simple.txt (
    echo Testing simple.txt:
    cargo run --bin test_analyzer -- test-data\simple.txt
    echo.

    echo Testing complex.txt:
    cargo run --bin test_analyzer -- test-data\complex.txt
    echo.

    echo Testing data-refs.txt:
    cargo run --bin test_analyzer -- test-data\data-refs.txt
    echo.
) else (
    echo Warning: test-data directory not found, skipping
    echo.
)

echo ========================================
echo All tests passed!
echo ========================================
echo.
echo Next steps:
echo   - Open test-browser.html in a browser for browser tests
echo   - Run 'cargo bench' for performance benchmarks
echo.

exit /b 0
