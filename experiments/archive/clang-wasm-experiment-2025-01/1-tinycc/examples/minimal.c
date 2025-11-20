// Minimal C test case
// Should compile to a few ARM Thumb instructions

void main(void) {
    volatile int x = 42;
    volatile int y = x + 8;
}
