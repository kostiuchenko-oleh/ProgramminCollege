#include <iostream>

int main() {
    const char* s = "#include <iostream>\nint main() {\n    std::cout << \"Oleg\" << std::endl;\n    return 0;\n}\n";
    std::cout << s;
    return 0;
}