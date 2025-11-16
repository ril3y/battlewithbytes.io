@echo off
REM BattleMagic Analyzer - Complete Test Suite (Windows)
REM Runs ALL tests including benchmarks

echo ========================================
echo BattleMagic Analyzer - Complete Test Suite
echo ========================================
echo.

REM Run standard tests
call test.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Standard tests failed
    exit /b 1
)

REM Run benchmarks
echo.
echo [BONUS] Running performance benchmarks...
echo ----------------------------------------
echo This may take several minutes...
echo.
cargo bench --bench analyzer_bench

echo.
echo ========================================
echo All tests and benchmarks complete!
echo ========================================
echo.
echo Check target\criterion for benchmark reports
echo.

exit /b 0
