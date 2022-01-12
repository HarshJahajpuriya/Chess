#include <iostream>
using namespace std;

int main()
{
  string v;
  cin >> v;
  int n;
  cin >> n;
  string bGroups[n];
  for (int i = 0; i < n; i++)
    cin >> bGroups[i];

  int i = 0, j;
  bool found;
  while (i < n)
  {
    
    int z = 0;
    j=0;
    found = true;
    while(j<bGroups[i].length()) {
      while(z<v.length()) {
        if(bGroups[i][j] == v[z]) break;
        z++;
      }
        // cout<<bGroups[i]<< " "<<z<<endl;
      if(z == v.length()) {
        found = false;
        break;
      }
      j++;
    }

    if(found) cout<<"POSITIVE"<<endl;
    else cout<<"NEGATIVE"<<endl;

    i++;
  }

  return 0;
}