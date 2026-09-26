# Keymel Çiçekçilik

Keymel Çiçekçilik için hazırlanmış Express tabanlı mağaza, sepet, WhatsApp sipariş akışı ve yönetim paneli.

## Çalıştırma

```bash
npm install
npm start
```

Site: http://localhost:3000  
Admin: http://localhost:3000/admin.html

## Müşteri akışı
Müşteri hesap oluşturmaz ve kartla ödeme yapmaz. Ürünleri sepete ekler, sipariş bilgilerini doldurur ve **WhatsApp'tan Sipariş Ver** düğmesine basar. Sunucu ürün fiyatlarını yeniden hesaplayıp siparişi `data/store.json` içine kaydeder ve WhatsApp'ta hazır sipariş mesajını açar.

## Admin paneli
Panelden ürün adı, kategori, fiyat, indirim, açıklama, fotoğraf, yayın durumu ve öne çıkarma yönetilir. Site iletişim bilgileri, ana sayfa metinleri, hizmetler, SSS ve mağaza geneli indirim de panelden değiştirilebilir. Fotoğraflar `uploads/` klasörüne yüklenir.

Siparişler WhatsApp kanalıyla panelde görünür. Durumlar: `WhatsApp bekleniyor`, `Sipariş onaylandı`, `Hazırlanıyor`, `Teslim edildi`, `İptal`. Siparişler CSV olarak dışa aktarılabilir.

## WhatsApp
WhatsApp numarası admin panelindeki **Site Ayarları > WhatsApp numarası** alanından yönetilir. Varsayılan numara Keymel'in 0506 144 57 06 numarasıdır.

## Admin şifresi
`.env` içindeki `ADMIN_USER`, `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` yalnızca yönetim paneli içindir. `.env` değişikliğinden sonra sunucuyu tamamen durdurup yeniden başlatın.

Canlı kullanımda HTTPS, güçlü bir admin şifresi ve güçlü bir `ADMIN_SESSION_SECRET` kullanın. `data/store.json` ürün ve sipariş verisini tutar; düzenli yedek alın.
