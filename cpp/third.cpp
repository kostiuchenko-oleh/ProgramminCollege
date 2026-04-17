#include <iostream>
#include <string>

int main() {
    // Олег
    std::string program;
    std::string line;
    while (std::getline(std::cin, line)) {
        program += line + "\n";
    }

    if (program.find("while(true)") != std::string::npos ||
        program.find("for(;;)") != std::string::npos ||
        program.find("while(1)") != std::string::npos) {
        std::cout << "ця програма не зупиниться..." << std::endl;
    }
    else if (program.find("return 0;") != std::string::npos || 
             program.length() < 100) {
        std::cout << "ця програма зупиниться!" << std::endl;
    }
    else {
        std::cout << "не можу точно визначити..." << std::endl;
    }
    return 0;
}