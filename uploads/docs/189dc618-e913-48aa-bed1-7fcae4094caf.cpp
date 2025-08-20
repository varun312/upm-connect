#include <bits/stdc++.h>
using namespace std;

#define pb push_back
#define pf push_front
#define mp make_pair
#define fi first
#define se second
#define int long long
#define all(x) (x).begin(), (x).end()

typedef long double ld;
typedef long long ll;
typedef pair<ll,ll> pll;
typedef pair<int,int> pii;
typedef vector<int> vi;
typedef vector<ll> vll;
typedef vector<bool> vb;
typedef vector<vector<int>> vvi;
typedef vector<vector<bool>> vvb;
typedef vector<vector<ll>> vvll;
typedef vector<string> vs;
typedef vector<vector<string>> vvs;
typedef vector<char> vc;
typedef vector<vector<char>> vvc;
typedef map<int, int> mii;
typedef unordered_map<int, int> umii;

const int mod = 1e9 + 7;
const int inf = INTMAX_MAX;
const bool tc = true;

inline void solve() {
    int n, q;
    cin >> n >> q;
    string x, y;
    cin >> x >> y;
    int ans = 0;
    for (int i = n - 2; i >= 0; i--) {
        if (x[i] == y[i]) continue;
        if (x[i] == x[i + 1]) {
            x[i] = y[i];
            ans++;
        } else {
            break;
        }
    }
    cout << (x == y ? "YES" : "NO") << '\n';
    cout << ans << '\n';
}

void setIO(string s) {
    freopen((s + ".in").c_str(), "r", stdin);
    freopen((s + ".out").c_str(), "w", stdout);
}

signed main() {
    ios::sync_with_stdio(false);
    cout.tie(0);
    cin.tie(0);
    //setIO();

    int t = 1;
    if (tc) {
        cin >> t;
    }

    while (t--) {
        solve();
    }
}
