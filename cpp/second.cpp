#include <iostream>
#include <string>

int main() {
    // Олег
    std::string my_code = "#include <iostream>\nint main() {\n    std::cout << \"Oleg\" << std::endl;\n    return 0;\n}";
    
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line + "\n";
    }
    if (!input.empty() && input.back() == '\n') 
        input.pop_back();

    if (input == my_code) {
        std::cout << "це мій код!" << std::endl;
    } else {
        std::cout << "це не мій код" << std::endl;
    }
    return 0;
}