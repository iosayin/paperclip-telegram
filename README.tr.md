# paperclip-telegram (Türkçe)

**[Paperclip](https://github.com/paperclipai/paperclip) ajanlarınızın onay ve sorularını Telegram'dan düğmeyle cevaplayın.**

Ajan durup soruyor: *"Bu PR'ı birleştireyim mi?"*, *"Hangi fiyat modeli?"*. Panele girmek yerine kart telefonunuza gelir, düğmeye basarsınız. Cevap Paperclip'e yazılır, ajan devam eder.

- ✅ Onay kartları → *Onayla / Reddet* düğmeleri
- ❓ Soru formları → her soru ayrı mesaj, her seçenek ayrı düğme; form tamamlanınca cevaplar birlikte gönderilir
- 🟢 `/status` → çalışan ajanlar ve sizi bekleyen her şey
- ⚠️ Başarısız ajan çalışmalarında kısa uyarı
- 🔒 Tek izinli sohbet, açık port yok, model token'ı harcamaz, bağımlılık yok

## Kurulum

1. [@BotFather](https://t.me/BotFather) → `/newbot` → token'ı alın.
2. Kartları cevaplayan hesabınız için Paperclip board token'ı alın.
3. `cp .env.example .env`, alanları doldurun, `PT_LANG=tr` yapın, `node src/index.mjs --check` ile deneyin.
4. `node src/index.mjs` çalıştırıp bota `/start` yazın; bot sohbet kimliğinizi söyler. `.env`'e `TELEGRAM_CHAT_ID` olarak yazıp yeniden başlatın.
5. Servis olarak çalıştırmak için [`examples/`](examples) (systemd, launchd, Docker).

Ayrıntılar ve güvenlik notları için [README.md](README.md).
