# ADR 0003 – Abos über RevenueCat, Entitlements serverseitig

> **Status:** vorgeschlagen · 2026-11-03

## Kontext

Digitale Abos müssen über Apple In-App-Purchase und Google Play Billing laufen. Beide APIs unterscheiden sich
stark (Receipts, Server-Notifications, Grace Periods, Familienfreigabe, Preiserhöhungen). Die Berechtigungen
müssen serverseitig autoritativ sein.

## Entscheidung

**RevenueCat** als Abstraktionsschicht (SDK `react-native-purchases` in der App, Webhooks an eine Edge Function).

- App-User-ID in RevenueCat = Supabase-User-UUID (pseudonym, keine E-Mail an RevenueCat).
- Webhook `billing-webhook` (Authorization-Secret) → Abgleich mit RevenueCat-REST → schreibt `store_subscriptions`.
- Effektive Stufe = View `entitlements` (max aus Store-Abo, Comp-Grant, Family-Mitgliedschaft).
- Der Client liest Entitlements **aus unserer DB**, nicht aus dem RevenueCat-SDK, um Abweichungen zu vermeiden;
  das SDK dient nur zum Kauf und für Store-Preise.
- Kosten: laut mehreren Drittquellen kostenlos bis 2.500 $ monatlich getrackten Umsatz, danach ca. 1 % (auf
  Bruttoumsatz vor Store-Anteil). **Vor Vertragsabschluss auf revenuecat.com prüfen.**

## Alternativen

- **Direkt StoreKit 2 + Play Billing Library** (z. B. `react-native-iap`/`expo-iap`) mit eigener Receipt-Validierung:
  keine Umsatzbeteiligung, aber hoher Implementierungs- und Wartungsaufwand und Fehlerrisiko bei Randfällen → für v1 verworfen;
  Wechsel später möglich, da Entitlements bei uns liegen.
- **Adapty, Qonversion, Superwall** o. ä.: funktional ähnlich; RevenueCat hat die größte Verbreitung und Dokumentation.

## Konsequenzen

- RevenueCat ist Auftragsverarbeiter (US) → DPA, Eintrag in privacy.md.
- Bei Ausfall von RevenueCat bleiben bestehende Entitlements gültig (DB), nur neue Käufe verzögern sich.
