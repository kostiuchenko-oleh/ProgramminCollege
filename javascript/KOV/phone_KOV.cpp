#include <iostream>
using namespace std;

int main() {
    int min;             // поточний мінімум
    int num;             // поточне число, яке зчитуємо
    int pos = 1;         // позиція поточного мінімуму (починаємо з 1)
    int duplicates = 1;  // кількість входжень поточного мінімуму
    // Зчитуємо перше число
      if (!(cin >> min)) {
          std::cout << 0 << '\n';
            return 0;
      }
    // Зчитуємо всі наступні числа
    int current_pos = 2;   // позиція наступного числа
        while (cin >> num) {
            if (num < min) {
                // знайшли новий менший елемент
                min = num;
                pos = current_pos;
                duplicates = 1;
            }
            else if (num == min) {
                      // ще один елемент з такою самою вагою
                    duplicates++;
                  }
              current_pos++;   // переходимо до наступної позиції
        }
      // Якщо duplicates == 1 — єдиний мінімум, виводимо його позицію
      // інакше — 0
          if (duplicates == 1)
              cout << pos << '\n';
          else 
                cout << 0 << '\n';
            return 0;
}
