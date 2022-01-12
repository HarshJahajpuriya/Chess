#include<iostream>
using namespace std;

int main() {
  string s = "Something";

  int i = 0;
  int j = s.length()-1;

  char tmp;
  while(i<=j) {
    tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
    j--;
    i++;
  }

  cout<<s<<endl;

  return 0;
}


// insert into customers (col1, col2) value(101, 'Someone', 'Something');

// Join
// Outer
// Inner
// Left join
// right join