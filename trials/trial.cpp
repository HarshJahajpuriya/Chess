#include<iostream>
using namespace std;

int main() {
    int n;
    cin>>n;
    int a[n], i = 0;
    while(i<n) {
        cin>>a[i];
        i++;
    }

    int largest = INT32_MIN, secondLargest = INT32_MIN;

    i=0;
    while(i<n) {
        if(a[i] > secondLargest) {
            if(a[i] > largest) {
                secondLargest = largest;
                largest = a[i];
            } else if(a[i] == largest) {

            } else {
                secondLargest = a[i];
            }
        }
        i++;
    }

    if(secondLargest == INT32_MIN) {
        secondLargest = -1;
    }

    cout<<secondLargest;

    return 0;
}