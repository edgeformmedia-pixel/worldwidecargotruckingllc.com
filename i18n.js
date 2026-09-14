(() => {
  "use strict";

  const STORAGE_KEY = "wcx_language";
  const uz = {
    "Worldwide Cargo Express LLC | Freight That Moves Business": "Worldwide Cargo Express LLC | Biznesingizni oldinga siljitadigan yuk tashish",
    "Worldwide Cargo Express LLC — dependable freight capacity and nationwide logistics solutions.": "Worldwide Cargo Express LLC — ishonchli yuk tashish quvvati va butun mamlakat bo‘ylab logistika yechimlari.",
    "Driver Application | Worldwide Cargo Express": "Haydovchi arizasi | Worldwide Cargo Express", "Apply to drive with Worldwide Cargo Express LLC.": "Worldwide Cargo Express LLC’da haydovchilikka ariza bering.",
    "Request a Freight Quote | Worldwide Cargo Express": "Yuk tashish narxini so‘rash | Worldwide Cargo Express", "Request a freight quote from Worldwide Cargo Express LLC.": "Worldwide Cargo Express LLC’dan yuk tashish narxini so‘rang.",
    "My Account | Worldwide Cargo Express": "Mening hisobim | Worldwide Cargo Express", "Create Account | Worldwide Cargo Express": "Hisob yaratish | Worldwide Cargo Express", "Reset Password | Worldwide Cargo Express": "Parolni tiklash | Worldwide Cargo Express", "Recruiting Admin | Worldwide Cargo Express": "Rekruting boshqaruvi | Worldwide Cargo Express",
    "Services": "Xizmatlar", "Coverage": "Qamrov", "Drive With Us": "Biz bilan haydang", "Drive with us": "Biz bilan haydang",
    "Sign In": "Kirish", "Sign in": "Kirish", "Create Account": "Hisob yaratish", "Create account": "Hisob yaratish",
    "Request a Quote": "Narx so‘rash", "Request a quote": "Narx so‘rash", "Apply to Drive": "Haydovchilikka ariza berish", "Apply to drive": "Haydovchilikka ariza berish",
    "North American Freight Solutions": "Shimoliy Amerika yuk tashish yechimlari",
    "Freight that keeps your business moving.": "Biznesingizni oldinga siljitadigan yuk tashish xizmati.",
    "Worldwide Cargo Express delivers dependable capacity, proactive communication, and the operational discipline complex supply chains require.": "Worldwide Cargo Express murakkab ta’minot zanjirlari uchun ishonchli quvvat, tezkor aloqa va tartibli operatsiyalarni ta’minlaydi.",
    "A transportation partner built for the pace of modern commerce.": "Zamonaviy savdo sur’atiga mos transport hamkori.",
    "Dispatch visibility": "Dispetcherlik nazorati", "Nationwide": "Butun mamlakat bo‘ylab", "Freight coverage": "Yuk tashish qamrovi", "One team": "Bitta jamoa", "Accountability": "Mas’uliyat",
    "What we move": "Nimalarni tashiymiz", "Capacity you can count on.": "Ishonishingiz mumkin bo‘lgan quvvat.",
    "From a single shipment to consistent lane coverage, we coordinate the people, equipment, and timing that keep your freight on track—without the handoffs that slow business down.": "Bir martalik jo‘natmadan muntazam yo‘nalishlargacha, yukingizni reja asosida yetkazish uchun xodimlar, uskunalar va vaqtni muvofiqlashtiramiz.",
    "01 / FULL TRUCKLOAD": "01 / TO‘LIQ YUK MASHINASI", "Dedicated FTL": "Maxsus FTL", "Reliable door-to-door capacity for your scheduled and time-sensitive freight.": "Rejali va vaqtga sezgir yuklaringiz uchun eshikdan eshikkacha ishonchli tashish.",
    "02 / EXPEDITED": "02 / TEZKOR", "Critical Freight": "Shoshilinch yuk", "Responsive solutions when a shipment cannot wait and visibility matters most.": "Yuk kutib turolmaydigan va kuzatuv muhim bo‘lgan holatlar uchun tezkor yechimlar.",
    "03 / LOGISTICS": "03 / LOGISTIKA", "Managed Transportation": "Boshqariladigan transport", "A single accountable team for complex movements, changing needs, and steady communication.": "Murakkab tashuvlar, o‘zgaruvchan ehtiyojlar va uzluksiz aloqa uchun yagona mas’ul jamoa.",
    "Designed for the long haul": "Uzoq yo‘l uchun yaratilgan", "National reach.": "Mamlakat bo‘ylab qamrov.", "Personal ownership.": "Shaxsiy mas’uliyat.",
    "Our network is built to serve the lanes your business depends on, while keeping every shipment connected to a team that knows the details.": "Tarmog‘imiz biznesingiz tayanadigan yo‘nalishlarga xizmat qiladi va har bir yukni tafsilotlarni biladigan jamoa nazoratida ushlab turadi.",
    "States served": "Xizmat ko‘rsatiladigan shtatlar", "Operations support": "Operatsion yordam", "Service mindset": "Xizmatga yondashuv", "Let's Talk": "Bog‘lanamiz", "Text": "SMS", "Email": "Elektron pochta", "All rights reserved.": "Barcha huquqlar himoyalangan.",
    "Freight transportation · Logistics · Capacity solutions ·": "Yuk tashish · Logistika · Tashish quvvati yechimlari ·", "© 2026 Worldwide Cargo Express LLC. All rights reserved. Freight transportation · Logistics · Capacity solutions ·": "© 2026 Worldwide Cargo Express LLC. Barcha huquqlar himoyalangan. Yuk tashish · Logistika · Tashish quvvati yechimlari ·", "Admin": "Administrator", "Freight trucks at a distribution terminal": "Tarqatish terminalidagi yuk mashinalari",
    "Worldwide Cargo Express home": "Worldwide Cargo Express bosh sahifasi", "Driver application": "Haydovchi arizasi", "Join the team": "Jamoaga qo‘shiling",
    "Your next mile starts here.": "Keyingi yo‘lingiz shu yerdan boshlanadi.", "Tell us a little about yourself. Your progress is saved securely as you go, so you can leave and come back on this device.": "O‘zingiz haqingizda qisqacha ma’lumot bering. Jarayon davomida ma’lumotlaringiz xavfsiz saqlanadi va ushbu qurilmada keyinroq davom ettirishingiz mumkin.",
    "Questions? Call": "Savollaringiz bormi? Qo‘ng‘iroq qiling", "Application": "Ariza", "Saved": "Saqlandi", "Saving…": "Saqlanmoqda…", "Not saved — retrying": "Saqlanmadi — qayta urinilmoqda",
    "Go back": "Orqaga qaytish", "← Back": "← Orqaga", "Back": "Orqaga", "Continue": "Davom etish", "Continue →": "Davom etish →",
    "First, choose the opportunity that fits you.": "Avval sizga mos imkoniyatni tanlang.", "Are you an owner-operator or a company driver?": "Siz egasi-operator yoki kompaniya haydovchisimi?",
    "We’ll tailor the next few questions to your selection.": "Keyingi savollarni tanlovingizga moslashtiramiz.", "By entering your information, you agree that Worldwide Cargo Express may contact you about this driver job opportunity. We’ll tailor the next few questions to your selection.": "Ma’lumotlaringizni kiritish orqali Worldwide Cargo Express ushbu haydovchilik imkoniyati bo‘yicha siz bilan bog‘lanishiga rozilik bildirasiz. Keyingi savollar tanlovingizga moslashtiriladi.",
    "Owner-operator": "Egasi-operator", "I operate my own truck": "O‘z yuk mashinamni boshqaraman", "Company driver": "Kompaniya haydovchisi", "I want to drive company equipment": "Kompaniya transportini boshqarmoqchiman",
    "Female": "Ayol", "Male": "Erkak", "Non-binary": "Nobinar", "Prefer not to say": "Aytmaslikni afzal ko‘raman", "Less than 1 year": "1 yildan kam", "Less than 2 years": "2 yildan kam", "Less than 5 years": "5 yildan kam", "Less than 10 years": "10 yildan kam",
    "Yes": "Ha", "No": "Yo‘q", "Tomorrow": "Ertaga", "This week": "Shu hafta", "More than a week from now": "Bir haftadan keyin", "More than a week": "Bir haftadan ko‘p",
    "About you": "Siz haqingizda", "Let’s start with your name.": "Ismingizdan boshlaymiz.", "Enter your full legal name.": "To‘liq rasmiy ismingizni kiriting.", "Full name": "To‘liq ism",
    "Contact details": "Aloqa ma’lumotlari", "What’s the best phone number to reach you?": "Siz bilan bog‘lanish uchun eng qulay telefon raqami qaysi?", "Include your area code.": "Hudud kodini ham kiriting.", "What’s your email address?": "Elektron pochta manzilingiz qanday?", "We’ll use this only to contact you about your application.": "Bu manzildan faqat arizangiz bo‘yicha bog‘lanish uchun foydalanamiz.",
    "How do you describe your gender?": "Jinsingizni qanday belgilaysiz?", "Choose the option that fits you best.": "Sizga eng mos variantni tanlang.", "Driving experience": "Haydovchilik tajribasi", "How many years of driving experience do you have?": "Necha yillik haydovchilik tajribangiz bor?", "Choose your total professional truck-driving experience.": "Umumiy professional yuk mashinasi haydovchilik tajribangizni tanlang.",
    "Your equipment": "Transportingiz", "What year was your truck made?": "Yuk mashinangiz qaysi yilda ishlab chiqarilgan?", "Enter the four-digit model year.": "To‘rt xonali ishlab chiqarilgan yilni kiriting.", "How many miles are on your truck?": "Yuk mashinangiz qancha mil yurgan?", "An estimate is okay. Enter numbers only.": "Taxminiy raqam bo‘lishi mumkin. Faqat son kiriting.", "Do you currently have a plate for your truck?": "Hozir yuk mashinangizning davlat raqami bormi?", "Choose yes or no.": "Ha yoki yo‘qni tanlang.",
    "Do you have experience with Amazon Relay?": "Amazon Relay bilan tajribangiz bormi?", "Availability": "Ish boshlash vaqti", "When can you start?": "Qachon ish boshlashingiz mumkin?", "Choose the earliest option that works for you.": "Sizga mos eng yaqin muddatni tanlang.",
    "Optional documents": "Ixtiyoriy hujjatlar", "Want to get ahead?": "Jarayonni tezlashtirmoqchimisiz?", "You can securely upload your CDL and DOT medical card now, or continue without them.": "CDL va DOT tibbiy kartangizni hozir xavfsiz yuklashingiz yoki ularsiz davom etishingiz mumkin.", "Yes, upload my documents": "Ha, hujjatlarimni yuklayman", "No, continue without them": "Yo‘q, ularsiz davom etaman", "I agree to the secure processing of my CDL and medical card solely to evaluate my driver application.": "CDL va tibbiy kartam faqat haydovchilik arizamni baholash uchun xavfsiz qayta ishlanishiga roziman.",
    "DOT medical card": "DOT tibbiy kartasi", "Choose a JPG, PNG, or PDF up to 5 MB.": "5 MB gacha bo‘lgan JPG, PNG yoki PDF faylni tanlang.", "Please confirm consent before uploading.": "Yuklashdan oldin rozilikni tasdiqlang.", "Choose a file smaller than 5 MB.": "5 MB dan kichik faylni tanlang.", "Uploading securely…": "Xavfsiz yuklanmoqda…", "Upload failed.": "Yuklash amalga oshmadi.", "Upload failed. Please try again.": "Yuklash amalga oshmadi. Qayta urinib ko‘ring.",
    "Saved automatically as you type": "Yozishingiz bilan avtomatik saqlanadi", "Final step": "Yakuniy bosqich", "Review": "Tekshirish", "Review your application.": "Arizangizni tekshiring.", "Use Back to make a change, or submit when everything looks right.": "O‘zgartirish uchun Orqaga tugmasini bosing yoki hammasi to‘g‘ri bo‘lsa yuboring.",
    "Driver type": "Haydovchi turi", "Name": "Ism", "Phone": "Telefon", "Gender": "Jins", "Experience": "Tajriba", "Truck year": "Yuk mashinasi yili", "Truck mileage": "Yurgan masofa", "Has plate": "Davlat raqami bor", "Can start": "Ish boshlashi mumkin", "Complete this security check before submitting.": "Yuborishdan oldin xavfsizlik tekshiruvini bajaring.", "Submit application": "Arizani yuborish", "Submitting…": "Yuborilmoqda…",
    "Application received": "Ariza qabul qilindi", "Thanks for applying.": "Ariza berganingiz uchun rahmat.", "Your driver account has been created. Choose a password to track your application and any load offers.": "Haydovchi hisobingiz yaratildi. Arizangiz va yuk takliflarini kuzatish uchun parol tanlang.",
    "Password": "Parol", "Confirm password": "Parolni tasdiqlang", "Use at least 10 characters.": "Kamida 10 ta belgidan foydalaning.", "Activate account →": "Hisobni faollashtirish →", "Activate account": "Hisobni faollashtirish", "We sent a five-digit code to": "Besh xonali kodni quyidagi manzilga yubordik:", "Verification code": "Tasdiqlash kodi", "Verify email →": "Elektron pochtani tasdiqlash →", "Verify email": "Elektron pochtani tasdiqlash", "Send a new code": "Yangi kod yuborish", "Sign in to your existing account": "Mavjud hisobingizga kiring",
    "Account": "Hisob", "Freight solutions": "Yuk tashish yechimlari", "Request a quote.": "Narx so‘rang.", "Share the details of your load and our team will review the lane, timing, equipment, and operating requirements.": "Yukingiz tafsilotlarini yuboring; jamoamiz yo‘nalish, muddat, uskuna va operatsion talablarni ko‘rib chiqadi.",
    "Before we begin": "Boshlashdan oldin", "What best describes you?": "Qaysi ta’rif sizga eng mos?", "Freight broker": "Yuk brokeri", "I’m arranging transportation for a customer": "Mijoz uchun transport tashkil qilyapman", "Direct shipper": "To‘g‘ridan-to‘g‘ri yuk jo‘natuvchi", "I’m shipping my company’s freight": "Kompaniyam yukini jo‘natyapman", "I’m a driver": "Men haydovchiman", "Take me to the driver application": "Haydovchi arizasiga o‘tish",
    "Contact": "Aloqa", "Who should we contact about this load?": "Bu yuk bo‘yicha kim bilan bog‘lanishimiz kerak?", "Company name": "Kompaniya nomi", "MC number": "MC raqami", "Load / reference number": "Yuk / ma’lumot raqami", "Optional": "Ixtiyoriy",
    "Pickup": "Yuklash", "Where and when is the freight available?": "Yuk qayerda va qachon tayyor bo‘ladi?", "Pickup city": "Yuklash shahri", "State": "Shtat", "ZIP code": "Pochta indeksi", "Pickup date": "Yuklash sanasi", "Pickup window": "Yuklash vaqti oralig‘i", "Appointment required?": "Oldindan kelishuv kerakmi?", "Choose": "Tanlang", "Facility type": "Obyekt turi", "Warehouse": "Ombor", "Business": "Korxona", "Residence": "Turar joy", "Port": "Port", "Military base": "Harbiy baza", "Job site": "Ish maydoni", "Other": "Boshqa",
    "Delivery": "Yetkazib berish", "Where and when does it need to arrive?": "Yuk qayerga va qachon yetib borishi kerak?", "Delivery city": "Yetkazish shahri", "Delivery date": "Yetkazish sanasi", "Delivery window": "Yetkazish vaqti oralig‘i",
    "Freight": "Yuk", "Tell us what is moving and the equipment required.": "Nima tashilayotgani va qanday uskuna kerakligini yozing.", "Equipment": "Uskuna", "53′ dry van": "53′ yopiq furgon", "Box / straight truck": "Furgon / to‘g‘ri yuk mashinasi", "Power only": "Faqat tyagach", "Not sure": "Aniq emas", "Commodity": "Yuk turi", "What is being shipped?": "Nima jo‘natilyapti?", "Total weight (lbs)": "Umumiy og‘irlik (funt)", "Pieces or pallets": "Dona yoki palletlar", "Dimensions / linear feet": "O‘lchamlar / uzunlik futlarda", "Stackable?": "Ustma-ust qo‘yish mumkinmi?", "Hazardous material?": "Xavfli materialmi?", "Temperature controlled?": "Harorat nazorati kerakmi?", "Temperature range": "Harorat oralig‘i", "If applicable": "Tegishli bo‘lsa", "Load type": "Yuklash turi", "Live load/unload": "Jonli yuklash/tushirish", "Drop-and-hook": "Tirkamani almashtirish", "Either": "Ikkalasi ham", "Special services": "Maxsus xizmatlar", "Optional — liftgate, driver assist, limited access, team or expedited": "Ixtiyoriy — lift, haydovchi yordami, cheklangan kirish, jamoa yoki tezkor xizmat", "Additional notes": "Qo‘shimcha izohlar",
    "Submitting this form requests a quote. It is not a booking, rate confirmation, or guarantee of capacity.": "Ushbu shaklni yuborish narx so‘rovi hisoblanadi. Bu bron, tarif tasdig‘i yoki quvvat kafolati emas.", "Submit quote request →": "Narx so‘rovini yuborish →", "Quote received": "Narx so‘rovi qabul qilindi", "Your request is in.": "So‘rovingiz qabul qilindi.", "Your customer account has been created. Choose a password to track this quote and future requests.": "Mijoz hisobingiz yaratildi. Ushbu va kelajakdagi so‘rovlarni kuzatish uchun parol tanlang.",
    "Your portal": "Sizning portalingiz", "View your application, quotes, and driver offers.": "Arizangiz, narx so‘rovlaringiz va haydovchi takliflarini ko‘ring.", "Log out": "Chiqish", "Need an account?": "Hisob kerakmi?", "Create one": "Hisob yarating", "Forgot your password?": "Parolingizni unutdingizmi?", "Account dashboard": "Hisob boshqaruv paneli", "Welcome": "Xush kelibsiz", "Start an application": "Arizani boshlash", "Driver offers": "Haydovchi takliflari", "Quote history": "Narx so‘rovlari tarixi",
    "Get started": "Boshlash", "Create a portal account for driving, arranging freight, or shipping your own freight.": "Haydovchilik, yuk tashishni tashkil qilish yoki o‘z yukingizni jo‘natish uchun portal hisobini yarating.", "Account type": "Hisob turi", "Choose one": "Birini tanlang", "Driver": "Haydovchi", "Shipper": "Yuk jo‘natuvchi", "Already have an account?": "Hisobingiz bormi?", "Check your inbox": "Kiruvchi xatlarni tekshiring", "Verify your email": "Elektron pochtangizni tasdiqlang",
    "Account recovery": "Hisobni tiklash", "Reset password": "Parolni tiklash", "Enter your account email and we’ll send a five-digit reset code.": "Hisobingiz elektron pochta manzilini kiriting, biz besh xonali tiklash kodini yuboramiz.", "Send reset code": "Tiklash kodini yuborish", "Choose a new password": "Yangi parol tanlang", "Five-digit code": "Besh xonali kod", "New password": "Yangi parol", "Confirm new password": "Yangi parolni tasdiqlang", "Update password": "Parolni yangilash", "Send another code": "Boshqa kod yuborish", "Password updated": "Parol yangilandi", "You’re all set.": "Hammasi tayyor.", "Your password has been changed. You can now sign in.": "Parolingiz o‘zgartirildi. Endi tizimga kirishingiz mumkin.", "Return to sign in": "Kirish sahifasiga qaytish",
    "Recruiting operations": "Rekruting operatsiyalari", "Welcome back.": "Qaytganingiz bilan.", "Open dashboard": "Boshqaruv panelini ochish", "Forgot password?": "Parolni unutdingizmi?", "Administrator access": "Administrator ruxsati", "Choose a password.": "Parol tanlang.", "Recruiting workspace": "Rekruting ish maydoni", "Admin navigation": "Administrator navigatsiyasi", "Home": "Bosh sahifa", "View drivers": "Haydovchilar", "Quote requests": "Narx so‘rovlari", "Outbound email": "Chiquvchi xatlar", "Admin users": "Administratorlar", "Open Request a Quote ↗": "Narx so‘rovini ochish ↗", "Open navigation": "Navigatsiyani ochish", "Recruiting overview": "Rekruting sharhi", "Loading…": "Yuklanmoqda…", "Refresh data": "Ma’lumotlarni yangilash",
    "Keep every driver moving.": "Har bir haydovchi jarayonini oldinga siljiting.", "See what needs attention and move applicants through one clear process.": "E’tibor talab qiladigan ishlarni ko‘ring va arizachilarni yagona aniq jarayon orqali boshqaring.", "View driver pipeline": "Haydovchilar jarayonini ko‘rish", "Active applicants": "Faol arizachilar", "Across all six stages": "Barcha olti bosqich bo‘yicha", "Waiting for a call": "Qo‘ng‘iroq kutilmoqda", "New applicants to contact": "Bog‘lanish kerak bo‘lgan yangi arizachilar", "Waiting on documents": "Hujjatlar kutilmoqda", "CDL or medical card missing": "CDL yoki tibbiy karta yetishmayapti", "Documents received": "Hujjatlar qabul qilindi", "Ready for processing": "Qayta ishlashga tayyor", "Priority queue": "Ustuvor navbat", "Needs attention": "E’tibor talab qiladi", "See all": "Barchasini ko‘rish", "Recent demand": "So‘nggi talab", "Latest quote requests": "Oxirgi narx so‘rovlari",
    "Driver pipeline": "Haydovchilar jarayoni", "View archive": "Arxivni ko‘rish", "Search name, phone, or email": "Ism, telefon yoki email bo‘yicha qidiring", "All applications": "Barcha arizalar", "Incomplete applications": "Tugallanmagan arizalar", "Submitted applications": "Yuborilgan arizalar", "All driver types": "Barcha haydovchi turlari", "Owner-operators": "Egasi-operatorlar", "Company drivers": "Kompaniya haydovchilari", "All document statuses": "Barcha hujjat holatlari", "Missing CDL": "CDL yetishmayapti", "Missing medical card": "Tibbiy karta yetishmayapti", "Documents complete": "Hujjatlar to‘liq", "Medical card expired": "Tibbiy karta muddati tugagan", "Talk on phone": "Telefon orqali suhbat", "Documents requested": "Hujjatlar so‘raldi", "Collect CDL and medical card": "CDL va tibbiy kartani yig‘ish", "Documents processed": "Hujjatlar qayta ishlandi", "Packet is ready for partner": "Paket hamkor uchun tayyor", "Sold / hired for partner": "Hamkorga sotildi / ishga olindi", "Record the company hired to": "Ishga olgan kompaniyani kiriting", "Call back given to be hired": "Ishga olish uchun qayta qo‘ng‘iroq", "Enter payout, then activate": "To‘lovni kiriting, keyin faollashtiring", "Accounting": "Buxgalteriya", "Active drivers": "Faol haydovchilar", "Expected payout from active drivers": "Faol haydovchilardan kutilayotgan to‘lov", "Saved records": "Saqlangan yozuvlar", "Archived applicants": "Arxivlangan arizachilar",
    "Search company, contact, or route": "Kompaniya, aloqa yoki yo‘nalish bo‘yicha qidiring", "All statuses": "Barcha holatlar", "New": "Yangi", "Reviewing": "Ko‘rib chiqilmoqda", "Quoted": "Narx berildi", "Booked": "Bron qilindi", "Declined": "Rad etildi", "Requester": "So‘rovchi", "Route": "Yo‘nalish", "Updated": "Yangilangan", "No quote requests match this view.": "Bu ko‘rinishga mos narx so‘rovlari yo‘q.",
    "New message": "Yangi xabar", "Compose email": "Xat yozish", "Send from email address": "Qaysi emaildan yuborish", "To": "Kimga", "Subject": "Mavzu", "Message": "Xabar", "Send email": "Xat yuborish", "Company defaults": "Kompaniya sozlamalari", "Sender settings": "Jo‘natuvchi sozlamalari", "Default sender": "Standart jo‘natuvchi", "Reply-to email": "Javob manzili", "Save defaults": "Standartlarni saqlash", "Sent record": "Yuborilganlar", "Recent outbound email": "So‘nggi chiquvchi xatlar", "Invite an employee": "Xodimni taklif qilish", "Send as": "Nomidan yuborish", "Other send-as email": "Boshqa jo‘natuvchi emaili", "Send invitation": "Taklif yuborish", "Access list": "Ruxsatlar ro‘yxati", "Administrators": "Administratorlar",
    "Close": "Yopish", "Step 5": "5-bosqich", "Company sold to": "Sotilgan kompaniya", "Company note": "Kompaniya izohi", "Cancel": "Bekor qilish", "Save partner hire": "Hamkor ishga olishini saqlash", "Activate driver": "Haydovchini faollashtirish", "Record driver payout": "Haydovchi to‘lovini kiriting", "How much will you be paid for this driver?": "Bu haydovchi uchun qancha haq olasiz?", "Driver start date": "Haydovchi ish boshlash sanasi", "When is payment expected?": "To‘lov qachon kutilmoqda?", "1 week after start": "Boshlangandan 1 hafta keyin", "2 weeks after start": "Boshlangandan 2 hafta keyin", "Add active driver": "Faol haydovchi qo‘shish",
    "Received": "Qabul qilindi", "Needed": "Kerak", "Replace file": "Faylni almashtirish", "Upload": "Yuklash", "Accept": "Qabul qilish", "Decline": "Rad etish", "No additional notes": "Qo‘shimcha izoh yo‘q", "Rate to be discussed": "Narx kelishiladi", "Equipment pending": "Uskuna kutilmoqda", "Freight details pending": "Yuk tafsilotlari kutilmoqda"
  };

  const originals = new WeakMap();
  const rendered = new WeakMap();
  let language = localStorage.getItem(STORAGE_KEY) === "uz" ? "uz" : "en";
  let observer;

  function translate(value) {
    const key = value.trim();
    if (!key) return value;
    let result = uz[key];
    const patterns = [
      [/^Step (\d+) of (\d+)$/, "$1-bosqich, jami $2"], [/^Welcome, (.+)$/, "Xush kelibsiz, $1"],
      [/^(.+) uploaded\.$/, "$1 yuklandi."], [/^(\d[\d,]*) miles$/, "$1 mil"],
      [/^Submitted (.+) · ID (.+)$/, "$1 da yuborilgan · ID $2"], [/^Updated (.+)$/, "$1 da yangilangan"],
      [/^(.+) account$/, "$1 hisobi"], [/^A new code is on the way\.$/, "Yangi kod yuborildi."],
      [/^We sent a five-digit code to (.+)\.$/, "Besh xonali kod $1 manziliga yuborildi."]
    ];
    if (!result) for (const [pattern, replacement] of patterns) if (pattern.test(key)) { result = key.replace(pattern, replacement); break; }
    if (!result) return value;
    return `${value.match(/^\s*/u)[0]}${result}${value.match(/\s*$/u)[0]}`;
  }

  function translateText(node) {
    if (!originals.has(node) || node.nodeValue !== rendered.get(node)) originals.set(node, node.nodeValue);
    const value = language === "uz" ? translate(originals.get(node)) : originals.get(node);
    if (node.nodeValue !== value) node.nodeValue = value;
    rendered.set(node, value);
  }

  function translateElement(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: node => node.parentElement?.closest("script,style,[data-i18n-ignore]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    while (walker.nextNode()) translateText(walker.currentNode);
    const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll("[placeholder],[aria-label],[title]")] : [];
    for (const element of elements) for (const attr of ["placeholder", "aria-label", "title"]) {
      if (!element.hasAttribute(attr)) continue;
      const key = `i18n${attr.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;
      if (!element.dataset[key]) element.dataset[key] = element.getAttribute(attr);
      element.setAttribute(attr, language === "uz" ? translate(element.dataset[key]) : element.dataset[key]);
    }
  }

  function updateToggle() {
    const toggle = document.querySelector("#languageToggle");
    if (!toggle) return;
    toggle.querySelectorAll("button").forEach(button => { const active = button.dataset.lang === language; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
    toggle.setAttribute("aria-label", language === "uz" ? "Tilni tanlash" : "Choose language");
  }

  function setLanguage(next) {
    language = next === "uz" ? "uz" : "en";
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    translateElement(document.head);
    translateElement(document.body);
    updateToggle();
    document.dispatchEvent(new CustomEvent("wcx:languagechange", { detail: { language } }));
  }

  function init() {
    const style = document.createElement("style");
    style.textContent = ".language-toggle{position:fixed;left:16px;bottom:16px;z-index:2147483647;display:flex;align-items:center;padding:4px;border:1px solid rgba(255,255,255,.3);border-radius:999px;background:rgba(5,35,67,.94);box-shadow:0 8px 28px rgba(5,35,67,.25);backdrop-filter:blur(10px);font-family:Inter,Arial,sans-serif}.language-toggle button{min-width:42px;height:34px;padding:0 10px;border:0;border-radius:999px;background:transparent;color:#fff;font:800 13px/1 Inter,Arial,sans-serif;letter-spacing:.06em;cursor:pointer}.language-toggle button.active{background:#fff;color:#062b5a}.language-toggle button:focus-visible{outline:3px solid #f2b1ba;outline-offset:2px}@media(max-width:560px){.language-toggle{left:10px;bottom:10px}}";
    document.head.append(style);
    const toggle = document.createElement("div");
    toggle.id = "languageToggle"; toggle.className = "language-toggle"; toggle.dataset.i18nIgnore = "";
    toggle.innerHTML = '<button type="button" data-lang="en">EN</button><button type="button" data-lang="uz">UZ</button>';
    toggle.addEventListener("click", event => { const button = event.target.closest("button[data-lang]"); if (button) setLanguage(button.dataset.lang); });
    document.body.append(toggle);
    setLanguage(language);
    observer = new MutationObserver(mutations => {
      if (language !== "uz") return;
      observer.disconnect();
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateText(mutation.target);
        else for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) translateText(node);
          else if (node.nodeType === Node.ELEMENT_NODE && !node.closest("[data-i18n-ignore]")) translateElement(node);
        }
      }
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  window.WCX_I18N = { setLanguage, getLanguage: () => language, translate };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
