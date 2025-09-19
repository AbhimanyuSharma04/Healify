import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaRobot, FaHome, FaDatabase, FaUsers, FaInfoCircle, FaMoon, FaSun, FaComments, FaGlobe, FaPhone, FaHospital, FaStethoscope } from 'react-icons/fa';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-loading-skeleton/dist/skeleton.css';
import './App.css';

// This new component will render our interactive map
const OutbreakMap = ({ outbreaks, darkMode }) => {
  const mapCenter = [26.2006, 92.9376]; // Centered on Assam

  const getMarkerOptions = (outbreak) => {
    let color;
    switch (outbreak.severity) {
      case 'critical': color = '#dc3545'; break;
      case 'high': color = '#fd7e14'; break;
      case 'medium': color = '#0dcaf0'; break;
      case 'low': color = '#6c757d'; break;
      default: color = '#6c757d';
    }

    return {
      radius: 5 + (outbreak.cases / 3000), // Dynamic radius based on cases
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6
    };
  };

  return (
    <div className={`card mb-4 ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '450px', width: '100%' }} zoomControl={false}>
            <TileLayer
                url={darkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {outbreaks.map(outbreak => (
                <CircleMarker
                    key={outbreak.id}
                    center={outbreak.position}
                    pathOptions={getMarkerOptions(outbreak)}
                >
                    <Popup>
                        <div className="fw-bold fs-6 mb-2">{outbreak.name} - {outbreak.state}</div>
                        <div className="mb-1"><strong>Cases:</strong> {outbreak.cases.toLocaleString()}</div>
                        <div className="mb-2"><strong className="text-capitalize">Severity:</strong> <span style={{color: getMarkerOptions(outbreak).fillColor}}>{outbreak.severity}</span></div>
                        <hr className="my-2"/>
                        <div className="small mb-1"><FaPhone className="me-2 text-primary" /><strong>Helpline:</strong> {outbreak.healthContact}</div>
                        <div className="small mb-2"><FaHospital className="me-2 text-success" /><strong>Health Centers:</strong> {outbreak.nearbyHospitals}+</div>
                        <div className="small fst-italic"><strong>Latest Update:</strong> "{outbreak.latestNews}"</div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    </div>
  );
};


const HealthTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 rounded bg-light shadow-sm" style={{ fontSize: '0.8rem' }}>
        <strong>{label}</strong><br />
        {payload.map((p, idx) => (
          <div key={idx} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
        <em className="text-muted">💡 Did you know? Clean water prevents 80% of diarrheal diseases.</em>
      </div>
    );
  }
  return null;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    symptoms: [],
  });
  
  const [waterFormData, setWaterFormData] = useState({
  ph: '6.8',
  turbidity: '12.3',
  contaminantLevel: '150.5',
  temperature: '25.4',
  water_source_type: 'Groundwater',
  bacteria_count_cfu_ml: '500',   // NEW
  nitrate_level_mg_l: '10.2',     // NEW
  dissolved_oxygen_mg_l: '4.5',   // NEW
  file: null
});

  const [language, setLanguage] = useState('en');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [isWaterAnalyzing, setIsWaterAnalyzing] = useState(false);
  const [waterAnalysisResult, setWaterAnalysisResult] = useState(null);
  const [waterAnalysisError, setWaterAnalysisError] = useState(null);

  const mainChatRef = useRef(null);
  const widgetChatRef = useRef(null);

  const translations = {
    en: {
      home: "Home",
      submitWaterData: "Submit Data",
      diseasePrediction: "Disease Prediction",
      community: "Community Outreach",
      aiAssistant: "AI Assistant",
      about: "About Us",
      language: "Language",
      english: "English",
      hindi: "Hindi",
      assamese: "Assamese",
      bengali: "Bengali",
      heroTitle: "Northeast India Waterborne Disease Monitor",
      heroSubtitle: "Real-time Surveillance and Response System for Water-Borne Diseases",
      outbreakTitle: "Diarrhea Outbreak",
      statisticsTitle: "Northeast States Comparison",
      trendsTitle: "Disease Trends (Monthly)",
      emergencyTitle: "Emergency Response Status",
      disease: "Disease",
      state: "State",
      severity: "Severity Level",
      responseTeam: "Response Team",
      lastUpdate: "Last Update",
      predictionTitle: "Submit Health Data for AI Disease Prediction",
      predictionSubtitle: "Select symptoms and patient data, and our AI will provide a preliminary analysis of potential waterborne illnesses.",
      patientInfo: "Patient Information",
      fullName: "Full Name",
      age: "Age",
      gender: "Gender",
      location: "Location",
      symptoms: "Symptoms Observed",
      waterQuality: "Water Quality Parameters",
      waterSourceType: "Water Source Type",
      pH: "pH Level",
      turbidity: "Turbidity (NTU)",
      contaminantLevelPpm: "Contaminant Level (ppm)",
      waterTemperatureC: "Water Temperature (°C)",
      upload: "Upload File",
      submitButton: "Submit Data & Get Analysis",
      analysisTitle: "AI Analysis Results",
      analysisPlaceholder: "Your analysis will appear here after submission.",
      analyzingPlaceholder: "Our AI is analyzing the data... Please wait.",
      communityTitle: "Community Outreach Programs",
      communitySubtitle: "Join our health education initiatives and community events across Northeast India to learn about water safety and disease prevention.",
      eventsTitle: "Upcoming Events",
      programHighlights: "Program Highlights",
      onlinePrograms: "Online Programs",
      offlineEvents: "Offline Events",
      waterTesting: "Water Testing",
      chatTitle: "Healify AI Assistant",
      chatPlaceholder: "Ask about waterborne diseases...",
      chatFeatures: "AI Assistant Features",
      quickHelp: "Quick Help",
      diseaseSymptoms: "Disease symptoms",
      preventionTips: "Prevention tips",
      waterTesting2: "Water testing",
      aboutTitle: "About Healify",
      missionTitle: "Our Mission",
      missionText: "Healify is dedicated to revolutionizing public health monitoring through advanced AI and machine learning technologies. Our mission is to create a smart health surveillance system that detects, monitors, and prevents outbreaks of waterborne diseases in vulnerable communities across rural Northeast India.",
      visionTitle: "Our Vision",
      visionText: "To establish a comprehensive early warning system that empowers communities, health workers, and government officials with real-time insights and actionable intelligence to combat waterborne diseases effectively.",
      techStack: "Technology Stack",
      teamTitle: "Our Team",
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      upcoming: "Upcoming",
      registered: "registered",
      registerNow: "Register Now",
      description: "Description",
      prevention: "Prevention Methods",
      reportedCases: "Reported Cases",
      rate: "Rate",
      cases: "Cases",
      location2: "Location",
      send: "Send",
      aboutAI: "About Healify AI",
      aboutAIText: "Our AI assistant provides instant answers to your questions about waterborne diseases, prevention methods, and health resources in multiple languages.",
      symptomsTitle: "Symptoms:",
      preventionTitle: "Prevention Methods:",
      remediesTitle: "Cure and Remedies",
      statistics: "Outbreak Statistics",
      probability: "Match Score",
      noDiseaseDetectedTitle: "No Specific Disease Detected",
      noDiseaseDetectedDescription: "The combination of symptoms does not strongly match a single waterborne disease in our database. This does not rule out an illness.",
      noDiseaseDetectedRemedy: "Please consult a healthcare professional for an accurate diagnosis. Ensure you stay hydrated and monitor your symptoms.",
      genderOptions: { male: "Male", female: "Female", other: "Other" },
      symptomsList: [ "Fever", "Diarrhea", "Vomiting", "Abdominal Pain", "Dehydration", "Headache", "Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Rose spots", "Bloating", "Weight loss" ],
      diseases: {
          hepatitisA: { name: "Hepatitis A", description: "A liver infection caused by the Hepatitis A virus (HAV), highly contagious and spread through contaminated food or water.", remedies: ["Rest is crucial as there's no specific treatment.", "Stay hydrated by drinking plenty of fluids.", "Avoid alcohol and medications that can harm the liver."] },
          cholera: { name: "Cholera", description: "An acute diarrheal illness caused by infection of the intestine with Vibrio cholerae bacteria, which can be severe.", remedies: ["Immediate rehydration with Oral Rehydration Solution (ORS) is key.", "Seek urgent medical attention for severe cases.", "Zinc supplements can help reduce the duration of diarrhea."] },
          gastroenteritis: { name: "Gastroenteritis (Diarrhea)", description: "An intestinal infection marked by watery diarrhea, abdominal cramps, nausea or vomiting, and sometimes fever.", remedies: ["Drink plenty of liquids to prevent dehydration (ORS is best).", "Eat bland foods like bananas, rice, and toast (BRAT diet).", "Avoid dairy, fatty, or spicy foods."] },
          typhoid: { name: "Typhoid Fever", description: "A serious bacterial infection caused by Salmonella Typhi, characterized by a sustained high fever.", remedies: ["Requires immediate medical attention and is treated with antibiotics.", "Drink plenty of fluids to prevent dehydration.", "Eat a high-calorie, nutritious diet."] },
          giardiasis: { name: "Giardiasis", description: "An intestinal infection caused by a microscopic parasite called Giardia lamblia, often causing bloating and cramps without fever.", remedies: ["Medical treatment with prescription drugs is usually required.", "Stay well-hydrated.", "Avoid caffeine and dairy products, which can worsen diarrhea."] },
          crypto: { name: "Cryptosporidiosis", description: "A diarrheal disease caused by the microscopic parasite Cryptosporidium. It can cause watery diarrhea and is a common cause of waterborne disease.", remedies: ["Most people recover without treatment.", "Drink plenty of fluids to prevent dehydration.", "Anti-diarrheal medicine may help, but consult a doctor first."] }
      },
      ai: {
        initialGreeting: "Hello! I'm Healify AI. How can I assist you with waterborne diseases today? You can ask me things like 'What causes cholera?' or 'How to prevent typhoid?'",
        fallback: "I'm sorry, I don't have information on that. I can answer questions about the causes, symptoms, treatment, and prevention of diseases like Cholera, Typhoid, Hepatitis A, Giardiasis, and Gastroenteritis. Please try asking your question differently.",
      }
    },
    hi: {
        home: "होम",
        submitWaterData: "डेटा सबमिट करें",
        diseasePrediction: "रोग की भविष्यवाणी",
        community: "सामुदायिक आउटरीच",
        aiAssistant: "एआई सहायक",
        about: "हमारे बारे में",
        language: "भाषा",
        english: "अंग्रेज़ी",
        hindi: "हिंदी",
        assamese: "असमिया",
        bengali: "बंगाली",
        heroTitle: "पूर्वोत्तर भारत जलजनित रोग मॉनिटर",
        heroSubtitle: "जल-जनित रोगों के लिए वास्तविक समय की निगरानी और प्रतिक्रिया प्रणाली",
        outbreakTitle: "डायरिया का प्रकोप",
        statisticsTitle: "पूर्वोत्तर राज्यों की तुलना",
        trendsTitle: "रोग के रुझान (मासिक)",
        emergencyTitle: "आपातकालीन प्रतिक्रिया स्थिति",
        disease: "रोग",
        state: "राज्य",
        severity: "गंभीरता स्तर",
        responseTeam: "प्रतिक्रिया दल",
        lastUpdate: "अंतिम अपडेट",
        predictionTitle: "एआई रोग भविष्यवाणी के लिए स्वास्थ्य डेटा सबमिट करें",
        predictionSubtitle: "लक्षण और रोगी डेटा चुनें, और हमारा एआई संभावित जलजनित बीमारियों का प्रारंभिक विश्लेषण प्रदान करेगा।",
        patientInfo: "रोगी की जानकारी",
        fullName: "पूरा नाम",
        age: "आयु",
        gender: "लिंग",
        location: "स्थान",
        symptoms: "देखे गए लक्षण",
        waterQuality: "जल गुणवत्ता मापदंड",
        waterSourceType: "जल स्रोत का प्रकार",
        pH: "पीएच स्तर",
        turbidity: "गंदलापन (NTU)",
        contaminantLevelPpm: "संदूषक स्तर (ppm)",
        waterTemperatureC: "पानी का तापमान (°C)",
        upload: "फ़ाइल अपलोड करें",
        submitButton: "डेटा सबमिट करें और विश्लेषण प्राप्त करें",
        analysisTitle: "एआई विश्लेषण परिणाम",
        analysisPlaceholder: "आपका विश्लेषण सबमिशन के बाद यहां दिखाई देगा।",
        analyzingPlaceholder: "हमारा एआई डेटा का विश्लेषण कर रहा है... कृपया प्रतीक्षा करें।",
        communityTitle: "सामुदायिक आउटरीच कार्यक्रम",
        communitySubtitle: "जल सुरक्षा और रोग की रोकथाम के बारे में जानने के लिए पूर्वोत्तर भारत में हमारी स्वास्थ्य शिक्षा पहलों और सामुदायिक कार्यक्रमों में शामिल हों।",
        eventsTitle: "आगामी कार्यक्रम",
        programHighlights: "कार्यक्रम की मुख्य विशेषताएं",
        onlinePrograms: "ऑनलाइन कार्यक्रम",
        offlineEvents: "ऑफलाइन कार्यक्रम",
        waterTesting: "जल परीक्षण",
        chatTitle: "हीलिफाई एआई सहायक",
        chatPlaceholder: "जलजनित रोगों के बारे में पूछें...",
        chatFeatures: "एआई सहायक की विशेषताएं",
        quickHelp: "त्वरित मदद",
        diseaseSymptoms: "रोग के लक्षण",
        preventionTips: "रोकथाम के उपाय",
        waterTesting2: "जल परीक्षण",
        aboutTitle: "हीलिफाई के बारे में",
        missionTitle: "हमारा मिशन",
        missionText: "हीलिफाई उन्नत एआई और मशीन लर्निंग तकनीकों के माध्यम से सार्वजनिक स्वास्थ्य निगरानी में क्रांति लाने के लिए समर्पित है। हमारा मिशन एक स्मार्ट स्वास्थ्य निगरानी प्रणाली बनाना है जो ग्रामीण पूर्वोत्तर भारत में कमजोर समुदायों में जलजनित बीमारियों के प्रकोप का पता लगाता है, निगरानी करता है और रोकता है।",
        visionTitle: "हमारी दृष्टि",
        visionText: "एक व्यापक प्रारंभिक चेतावनी प्रणाली स्थापित करना जो समुदायों, स्वास्थ्य कार्यकर्ताओं और सरकारी अधिकारियों को जलजनित बीमारियों से प्रभावी ढंग से निपटने के लिए वास्तविक समय की अंतर्दृष्टि और कार्रवाई योग्य बुद्धिमत्ता के साथ सशक्त बनाती है।",
        techStack: "प्रौद्योगिकी स्टैक",
        teamTitle: "हमारी टीम",
        critical: "गंभीर",
        high: "उच्च",
        medium: "मध्यम",
        low: "कम",
        upcoming: "आगामी",
        registered: "पंजीकृत",
        registerNow: "अभी पंजीकरण करें",
        description: "विवरण",
        prevention: "रोकथाम के तरीके",
        reportedCases: "दर्ज मामले",
        rate: "दर",
        cases: "मामले",
        location2: "स्थान",
        send: "भेजें",
        aboutAI: "हीलिफाई एआई के बारे में",
        aboutAIText: "हमारा एआई सहायक कई भाषाओं में जलजनित रोगों, रोकथाम के तरीकों और स्वास्थ्य संसाधनों के बारे में आपके सवालों के तुरंत जवाब देता है।",
        symptomsTitle: "लक्षण:",
        preventionTitle: "रोकथाम के तरीके:",
        remediesTitle: "इलाज और उपचार",
        statistics: "प्रकोप के आँकड़े",
        probability: "मिलान स्कोर",
        noDiseaseDetectedTitle: "कोई विशेष रोग नहीं मिला",
        noDiseaseDetectedDescription: "लक्षणों का संयोजन हमारे डेटाबेस में किसी एक जलजनित रोग से दृढ़ता से मेल नहीं खाता है। यह किसी बीमारी को खारिज नहीं करता है।",
        noDiseaseDetectedRemedy: "कृपया सटीक निदान के लिए एक स्वास्थ्य पेशेवर से परामर्श करें। सुनिश्चित करें कि आप हाइड्रेटेड रहें और अपने लक्षणों की निगरानी करें।",
        genderOptions: { male: "पुरुष", female: "महिला", other: "अन्य" },
        symptomsList: ["बुखार", "दस्त", "उल्टी", "पेट दर्द", "निर्जलीकरण", "सिरदर्द", "थकान", "जी मिचलाना", "पीलिया", "गहरे रंग का मूत्र", "गुलाबी धब्बे", "पेट फूलना", "वजन कम होना"],
        diseases: {
            hepatitisA: { name: "हेपेटाइटिस ए", description: "हेपेटाइटिस ए वायरस (HAV) के कारण होने वाला एक यकृत संक्रमण, जो अत्यधिक संक्रामक है और दूषित भोजन या पानी से फैलता है।", remedies: ["आराम महत्वपूर्ण है क्योंकि कोई विशिष्ट उपचार नहीं है।", "खूब सारे तरल पदार्थ पीकर हाइड्रेटेड रहें।", "शराब और यकृत को नुकसान पहुँचाने वाली दवाओं से बचें।"] },
            cholera: { name: "हैजा", description: "विब्रियो कोलेरी बैक्टीरिया से आंत के संक्रमण के कारण होने वाली एक गंभीर दस्त की बीमारी, जो गंभीर हो सकती है।", remedies: ["ओरल रिहाइड्रेशन सॉल्यूशन (ORS) से तत्काल पुनर्जलीकरण महत्वपूर्ण है।", "गंभीर मामलों के लिए तत्काल चिकित्सा सहायता लें।", "जिंक सप्लीमेंट दस्त की अवधि को कम करने में मदद कर सकते हैं।"] },
            gastroenteritis: { name: "गैस्ट्रोएंटेराइटिस (दस्त)", description: "एक आंतों का संक्रमण जिसमें पानी वाले दस्त, पेट में ऐंठन, मतली या उल्टी और कभी-कभी बुखार होता है।", remedies: ["निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं (ORS सबसे अच्छा है)।", "केला, चावल और टोस्ट (BRAT आहार) जैसे नरम खाद्य पदार्थ खाएं।", "डेयरी, वसायुक्त या मसालेदार भोजन से बचें।"] },
            typhoid: { name: "टाइफाइड बुखार", description: "साल्मोनेला टाइफी के कारण होने वाला एक गंभीर जीवाणु संक्रमण, जिसकी विशेषता लगातार तेज बुखार है।", remedies: ["तत्काल चिकित्सा ध्यान देने की आवश्यकता है और इसका इलाज एंटीबायोटिक दवाओं से किया जाता है।", "निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं।", "उच्च-कैलोरी, पौष्टिक आहार खाएं।"] },
            giardiasis: { name: "गिआर्डियासिस", description: "जिआर्डिया लैम्ब्लिया नामक एक सूक्ष्म परजीवी के कारण होने वाला एक आंतों का संक्रमण, जो अक्सर बिना बुखार के पेट फूलना और ऐंठन का कारण बनता है।", remedies: ["आमतौर पर पर्चे वाली दवाओं से चिकित्सा उपचार की आवश्यकता होती है।", "अच्छी तरह से हाइड्रेटेड रहें।", "कैफीन और डेयरी उत्पादों से बचें, जो दस्त को बढ़ा सकते हैं।"] },
            crypto: { name: "क्रिप्टोस्पोरिडिओसिस", description: "सूक्ष्म परजीवी क्रिप्टोस्पोरिडियम के कारण होने वाली एक दस्त की बीमारी। यह पानी वाले दस्त का कारण बन सकती है और जलजनित बीमारी का एक आम कारण है।", remedies: ["ज्यादातर लोग बिना इलाज के ठीक हो जाते हैं।", "निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं।", "दस्त-रोधी दवा मदद कर सकती है, लेकिन पहले डॉक्टर से सलाह लें।"] }
        },
        ai: {
            initialGreeting: "नमस्ते! मैं हीलिफाई एआई हूँ। आज मैं जलजनित रोगों के बारे में आपकी कैसे सहायता कर सकता हूँ? आप मुझसे 'हैजा का कारण क्या है?' या 'टाइफाइड से कैसे बचें?' जैसे सवाल पूछ सकते हैं।",
            fallback: "मुझे खेद है, मेरे पास उस पर जानकारी नहीं है। मैं हैजा, टाइफाइड, हेपेटाइटिस ए, जिआर्डियासिस और गैस्ट्रोएंटेराइटिस जैसे रोगों के कारण, लक्षण, उपचार और रोकथाम के बारे में सवालों के जवाब दे सकता हूँ। कृपया अपना प्रश्न अलग तरीके से पूछने का प्रयास करें।",
        }
    },
    as: {
        home: "ঘৰ",
        submitWaterData: "তথ্য জমা দিয়ক",
        diseasePrediction: "ৰোগৰ ভৱিষ্যদ্বাণী",
        community: "সামাজিক প্ৰসাৰণ",
        aiAssistant: "এআই সহায়ক",
        about: "আমাৰ বিষয়ে",
        language: "ভাষা",
        english: "ইংৰাজী",
        hindi: "হিন্দী",
        assamese: "অসমীয়া",
        bengali: "বাংলা",
        heroTitle: "উত্তৰ-পূব ভাৰতৰ জলবাহিত ৰোগ নিৰীক্ষণ",
        heroSubtitle: "জল-বাহিত ৰোগৰ বাবে বাস্তৱ-সময়ৰ নিৰীক্ষণ আৰু সঁহাৰি প্ৰণালী",
        outbreakTitle: "ডায়েৰিয়াৰ প্ৰাদুৰ্ভাৱ",
        statisticsTitle: "উত্তৰ-পূবৰ ৰাজ্যসমূহৰ তুলনা",
        trendsTitle: "ৰোগৰ প্ৰৱণতা (মাহেকীয়া)",
        emergencyTitle: "জৰুৰীকালীন সঁহাৰি স্থিতি",
        disease: "ৰোগ",
        state: "ৰাজ্য",
        severity: "গুৰুত্বৰ স্তৰ",
        responseTeam: "সঁহাৰি দল",
        lastUpdate: "শেষ আপডেট",
        predictionTitle: "এআই ৰোগৰ ভৱিষ্যদ্বাণীৰ বাবে স্বাস্থ্য তথ্য জমা দিয়ক",
        predictionSubtitle: "লক্ষণ আৰু ৰোগীৰ তথ্য বাছনি কৰক, আৰু আমাৰ এআই-এ সম্ভাৱ্য পানীজনিত ৰোগৰ প্ৰাৰম্ভিক বিশ্লেষণ প্ৰদান কৰিব।",
        patientInfo: "ৰোগীৰ তথ্য",
        fullName: "সম্পূৰ্ণ নাম",
        age: "বয়স",
        gender: "লিঙ্গ",
        location: "স্থান",
        symptoms: "পৰ্যবেক্ষণ কৰা লক্ষণসমূহ",
        waterQuality: "পানীৰ গুণগত মানৰ মাপকাঠী",
        waterSourceType: "পানীৰ উৎসৰ প্ৰকাৰ",
        pH: "পিএইচ স্তৰ",
        turbidity: "ঘোলাपन (NTU)",
        contaminantLevelPpm: "দূষক স্তৰ (ppm)",
        waterTemperatureC: "পানীৰ উষ্ণতা (°C)",
        upload: "ফাইল আপলোড কৰক",
        submitButton: "তথ্য জমা দিয়ক আৰু বিশ্লেষণ লাভ কৰক",
        analysisTitle: "এআই বিশ্লেষণৰ ফলাফল",
        analysisPlaceholder: "আপোনাৰ বিশ্লেষণ দাখিলৰ পিছত ইয়াত দেখা যাব।",
        analyzingPlaceholder: "আমাৰ এআই-এ তথ্য বিশ্লেষণ কৰি আছে... অনুগ্ৰহ কৰি অপেক্ষা কৰক।",
        communityTitle: "সামাজিক প্ৰসাৰণ কাৰ্যসূচী",
        communitySubtitle: "পানীৰ সুৰক্ষা আৰু ৰোগ প্ৰতিৰোধৰ বিষয়ে জানিবলৈ উত্তৰ-পূব ভাৰতত আমাৰ স্বাস্থ্য শিক্ষাৰ পদক্ষেপ আৰু সামাজিক কাৰ্যসূচীত যোগদান কৰক।",
        eventsTitle: "আগন্তুক কাৰ্যসূচী",
        programHighlights: "কাৰ্যসূচীৰ মুখ্য অংশ",
        onlinePrograms: "অনলাইন কাৰ্যসূচী",
        offlineEvents: "অফলাইন কাৰ্যসূচী",
        waterTesting: "পানী পৰীক্ষা",
        chatTitle: "হিলিফাই এআই সহায়ক",
        chatPlaceholder: "জলবাহিত ৰোগৰ বিষয়ে সোধক...",
        chatFeatures: "এআই সহায়কৰ বৈশিষ্ট্য",
        quickHelp: "দ্ৰুত সহায়",
        diseaseSymptoms: "ৰোগৰ লক্ষণ",
        preventionTips: "প্ৰতিৰোধৰ উপায়",
        waterTesting2: "পানী পৰীক্ষা",
        aboutTitle: "হিলিফাইৰ বিষয়ে",
        missionTitle: "আমাৰ উদ্দেশ্য",
        missionText: "হিলিফাই উন্নত এআই আৰু মেচিন লাৰ্নিং প্ৰযুক্তিৰ জৰিয়তে জনস্বাস্থ্য নিৰীক্ষণত বৈপ্লৱিক পৰিৱৰ্তন আনিবলৈ সমৰ্পিত। আমাৰ উদ্দেশ্য হৈছে গ্ৰাম্য উত্তৰ-পূব ভাৰতৰ দুৰ্বল সম্প্ৰদায়সমূহত জলবাহিত ৰোগৰ প্ৰাদুৰ্ভাৱ চিনাক্ত, নিৰীক্ষণ আৰু প্ৰতিৰোধ কৰা এক স্মাৰ্ট স্বাস্থ্য নিৰীক্ষণ প্ৰণালী সৃষ্টি কৰা।",
        visionTitle: "আমাৰ দৃষ্টিভংগী",
        visionText: "এক ব্যাপক আগতীয়া সতৰ্কবাণী প্ৰণালী স্থাপন কৰা যি সম্প্ৰদায়, স্বাস্থ্য কৰ্মী আৰু চৰকাৰী বিষয়াসকলক জলবাহিত ৰোগৰ সৈতে ফলপ্ৰসূভাৱে মোকাবিলা কৰিবলৈ বাস্তৱ-সময়ৰ জ্ঞান আৰু কাৰ্যকৰী বুদ্ধিমত্তাৰে সজ্জিত কৰে।",
        techStack: "প্ৰযুক্তিৰ ষ্টেক",
        teamTitle: "আমাৰ দল",
        critical: " সংকটজনক",
        high: "उच्च",
        medium: "मध्यम",
        low: "নিম্ন",
        upcoming: "আগন্তুক",
        registered: "পঞ্জীভুক্ত",
        registerNow: "এতিয়া পঞ্জীয়ন কৰক",
        description: "বিৱৰণ",
        prevention: "প্ৰতিৰোধ পদ্ধতি",
        reportedCases: "ৰিপোৰ্ট কৰা ঘটনা",
        rate: "হাৰ",
        cases: "ঘটনা",
        location2: "স্থান",
        send: "প্ৰেৰণ কৰক",
        aboutAI: "হিলিফাই এআইৰ বিষয়ে",
        aboutAIText: "আমাৰ এআই সহায়কে বহু ভাষাত জলবাহিত ৰোগ, প্ৰতিৰোধ পদ্ধতি আৰু স্বাস্থ্য সম্পদৰ বিষয়ে আপোনাৰ প্ৰশ্নৰ তৎকালীন উত্তৰ দিয়ে।",
        symptomsTitle: "লক্ষণসমূহ:",
        preventionTitle: "প্ৰতিৰোধ পদ্ধতি:",
        remediesTitle: "নিৰাময় আৰু প্ৰতিকাৰ",
        statistics: "প্ৰাদুৰ্ভাৱৰ পৰিসংখ্যা",
        probability: "মিল স্কোৰ",
        noDiseaseDetectedTitle: "কোনো নিৰ্দিষ্ট ৰোগ ধৰা পৰা নাই",
        noDiseaseDetectedDescription: "লক্ষণসমূহৰ সংমিশ্ৰণে আমাৰ ডাটাবেছত কোনো এটা জলবাহিত ৰোগৰ সৈতে শক্তিশালীভাৱে মিল নাখায়। ই কোনো ৰোগ নুই নকৰে।",
        noDiseaseDetectedRemedy: "অনুগ্ৰহ কৰি সঠিক ৰোগ নিৰ্ণয়ৰ বাবে এজন স্বাস্থ্যসেৱা পেছাদাৰীৰ সৈতে পৰামৰ্শ কৰক। আপুনি হাইড্ৰেটেড থকাটো নিশ্চিত কৰক আৰু আপোনাৰ লক্ষণসমূহ নিৰীক্ষণ কৰক।",
        genderOptions: { male: "পুৰুষ", female: "মহিলা", other: "অন্য" },
        symptomsList: ["জ্বৰ", "ডায়েৰিয়া", "বমি", "পেটৰ বিষ", "ডিহাইড্ৰেচন", "মূৰৰ বিষ", "ভাগৰ", "বমি ভাব", "জণ্ডিচ", "গাঢ় ৰঙৰ প্ৰস্ৰাৱ", "গোলাপী দাগ", "পেট ফুলা", "ওজন হ্ৰাস"],
        diseases: {
            hepatitisA: { name: "হেপাটাইটিছ এ", description: "হেপাটাইটিছ এ ভাইৰাছ (HAV)ৰ ফলত হোৱা যকৃতৰ সংক্ৰমণ, যি অতি সংক্ৰামক আৰু দূষিত খাদ্য বা পানীৰ জৰিয়তে বিয়পে।", remedies: ["কোনো নিৰ্দিষ্ট চিকিৎসা নথকাৰ বাবে জিৰণি লোৱাটো গুৰুত্বপূৰ্ণ।", "যথেষ্ট তৰল পদাৰ্থ পান কৰি হাইড্ৰেটেড থাকক।", "মদ আৰু যকৃতৰ ক্ষতি কৰিব পৰা ঔষধ পৰিহাৰ কৰক।"] },
            cholera: { name: "কলেৰা", description: "ভিব্রিঅ' কলেৰি বেক্টেৰিয়াৰ দ্বাৰা অন্ত্ৰৰ সংক্ৰমণৰ ফলত হোৱা এক তীব্ৰ ডায়েৰিয়া ৰোগ, যি গুৰুতৰ হ'ব পাৰে।", remedies: ["ওৰেল ৰিহাইড্ৰেচন চলিউচন (ORS)ৰ সৈতে তৎকালীনভাৱে পুনৰজলীকৰণ কৰাটো মূল কথা।", "গুৰুতৰ ক্ষেত্ৰত তৎকালীন চিকিৎসাৰ সহায় লওক।", "জিংক পৰিপূৰকে ডায়েৰিয়াৰ সময়সীমা হ্ৰাস কৰাত সহায় কৰিব পাৰে।"] },
            gastroenteritis: { name: "গেষ্ট্ৰ'এণ্টেৰাইটিছ (ডায়েৰিয়া)", description: "পনীয়া ডায়েৰিয়া, পেটৰ বিষ, বমি ভাব বা বমি, আৰু কেতিয়াবা জ্বৰৰ দ্বাৰা চিহ্নিত এক অন্ত্ৰৰ সংক্ৰমণ।", remedies: ["ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক (ORS শ্ৰেষ্ঠ)।", "কল, ভাত আৰু টোষ্ট (BRAT diet)ৰ দৰে পাতল খাদ্য খাওক।", "গাখীৰ, চৰ্বিযুক্ত বা মচলাযুক্ত খাদ্য পৰিহাৰ কৰক।"] },
            typhoid: { name: "টাইফয়েড জ্বৰ", description: "চালমোনেলা টাইফিৰ ফলত হোৱা এক গুৰুতৰ বেক্টেৰিয়া সংক্ৰমণ, যাৰ বৈশিষ্ট্য হৈছে এক দীৰ্ঘস্থায়ী উচ্চ জ্বৰ।", remedies: ["তৎকালীন চিকিৎসাৰ প্ৰয়োজন আৰু ইয়াক এন্টিবায়োটিকৰ দ্বাৰা চিকিৎসা কৰা হয়।", "ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক।", "উচ্চ কেলৰিযুক্ত, পুষ্টিকৰ আহাৰ খাওক।"] },
            giardiasis: { name: "গিয়াৰ্ডিয়াচিছ", description: "গিয়াৰ্ডিয়া লেম্বলিয়া নামৰ এক অণুবীক্ষণিক পৰজীৱীৰ ফলত হোৱা এক অন্ত্ৰৰ সংক্ৰমণ, যিয়ে প্ৰায়ে জ্বৰ অবিহনে পেট ফুলা আৰু বিষৰ সৃষ্টি কৰে।", remedies: ["সাধাৰণতে চিকিৎসকৰ পৰামৰ্শ মতে ঔষধৰ সৈতে চিকিৎসাৰ প্ৰয়োজন হয়।", "ভালদৰে হাইড্ৰেটেড থাকক।", "কেফেইন আৰু গাখীৰৰ সামগ্ৰী পৰিহাৰ কৰক, যিয়ে ডায়েৰিয়া বঢ়াব পাৰে।"] },
            crypto: { name: "ক্ৰিপ্টোস্প'ৰিডিওচিছ", description: "অণুবীক্ষণিক পৰজীৱী ক্ৰিপ্টোস্প'ৰিডিয়ামৰ ফলত হোৱা এক ডায়েৰিয়া ৰোগ। ই পনীয়া ডায়েৰিয়াৰ সৃষ্টি কৰিব পাৰে আৰু ই জলবাহিত ৰোগৰ এক সাধাৰণ কাৰণ।", remedies: ["বেছিভাগ লোক চিকিৎসা অবিহনে আৰোগ্য হয়।", "ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক।", "ডায়েৰিয়া-প্ৰতিৰোধী ঔষধে সহায় কৰিব পাৰে, কিন্তু প্ৰথমে চিকিৎসকৰ পৰামৰ্শ লওক।"] }
        },
        ai: {
            initialGreeting: "নমস্কাৰ! মই হিলিফাই এআই। মই আজি আপোনাক জলবাহিত ৰোগৰ বিষয়ে কেনেদৰে সহায় কৰিব পাৰোঁ? আপুনি মোক 'কলেৰাৰ কাৰণ কি?' বা 'টাইফয়েড কেনেকৈ প্ৰতিৰোধ কৰিব?' আদি প্ৰশ্ন সুধিব পাৰে।",
            fallback: "মই দুঃখিত, মোৰ ওচৰত সেই বিষয়ে তথ্য নাই। মই কলেৰা, টাইফয়েড, হেপাটাইটিছ এ, গিয়াৰ্ডিয়াচিছ, আৰু গেষ্ট্ৰ'এণ্টেৰাইটিছৰ দৰে ৰোগৰ কাৰণ, লক্ষণ, চিকিৎসা, আৰু প্ৰতিৰোধৰ বিষয়ে প্ৰশ্নৰ উত্তৰ দিব পাৰোঁ। অনুগ্ৰহ কৰি আপোনাৰ প্ৰশ্নটো বেলেগ ধৰণে সুধিবলৈ চেষ্টা কৰক।",
        }
    },
    bn: {
        home: "হোম",
        submitWaterData: "ডেটা জমা দিন",
        diseasePrediction: "রোগের পূর্বাভাস",
        community: "সম্প্রদায় আউটরিচ",
        aiAssistant: "এআই সহকারী",
        about: "আমাদের সম্পর্কে",
        language: "ভাষা",
        english: "ইংরেজি",
        hindi: "হিন্দি",
        assamese: "অসমিয়া",
        bengali: "বাংলা",
        heroTitle: "উত্তর-পূর্ব ভারত জলবাহিত রোগ মনিটর",
        heroSubtitle: "জল-বাহিত রোগের জন্য রিয়েল-টাইম নজরদারি এবং প্রতিক্রিয়া ব্যবস্থা",
        outbreakTitle: "ডায়রিয়ার প্রাদুর্ভাব",
        statisticsTitle: "উত্তর-পূর্ব রাজ্যগুলির তুলনা",
        trendsTitle: "রোগের প্রবণতা (মাসিক)",
        emergencyTitle: "জরুরী প্রতিক্রিয়া স্থিতি",
        disease: "রোগ",
        state: "রাজ্য",
        severity: "গুরুতরতার স্তর",
        responseTeam: "প্রতিক্রিয়া দল",
        lastUpdate: "শেষ আপডেট",
        predictionTitle: "এআই রোগ পূর্বাভাসের জন্য স্বাস্থ্য ডেটা জমা দিন",
        predictionSubtitle: "লক্ষণ এবং রোগীর ডেটা নির্বাচন করুন, এবং আমাদের এআই সম্ভাব্য জলবাহিত অসুস্থতার একটি প্রাথমিক বিশ্লেষণ প্রদান করবে।",
        patientInfo: "রোগীর তথ্য",
        fullName: "পুরো নাম",
        age: "বয়স",
        gender: "লিঙ্গ",
        location: "অবস্থান",
        symptoms: "পর্যবেক্ষণ করা লক্ষণ",
        waterQuality: "জলের গুণমান পরামিতি",
        waterSourceType: "জলের উৎসের প্রকার",
        pH: "পিএইচ স্তর",
        turbidity: "ঘোলাত্ব (NTU)",
        contaminantLevelPpm: "দূষক স্তর (ppm)",
        waterTemperatureC: "জলের তাপমাত্রা (°C)",
        upload: "ফাইল আপলোড করুন",
        submitButton: "ডেটা জমা দিন এবং বিশ্লেষণ পান",
        analysisTitle: "এআই বিশ্লেষণ ফলাফল",
        analysisPlaceholder: "আপনার বিশ্লেষণ জমা দেওয়ার পরে এখানে উপস্থিত হবে।",
        analyzingPlaceholder: "আমাদের এআই ডেটা বিশ্লেষণ করছে... অনুগ্রহ করে অপেক্ষা করুন।",
        communityTitle: "সম্প্রদায় আউটরিচ প্রোগ্রাম",
        communitySubtitle: "জল নিরাপত্তা এবং রোগ প্রতিরোধ সম্পর্কে জানতে উত্তর-পূর্ব ভারত জুড়ে আমাদের স্বাস্থ্য শিক্ষা উদ্যোগ এবং সম্প্রদায় ইভেন্টগুলিতে যোগ দিন।",
        eventsTitle: "আসন্ন ঘটনাবলী",
        programHighlights: "প্রোগ্রামের হাইলাইটস",
        onlinePrograms: "অনলাইন প্রোগ্রাম",
        offlineEvents: "অফলাইন ইভেন্টস",
        waterTesting: "জল পরীক্ষা",
        chatTitle: "হিলিফাই এআই সহকারী",
        chatPlaceholder: "জলবাহিত রোগ সম্পর্কে জিজ্ঞাসা করুন...",
        chatFeatures: "এআই সহকারীর বৈশিষ্ট্য",
        quickHelp: "দ্রুত সাহায্য",
        diseaseSymptoms: "রোগের লক্ষণ",
        preventionTips: "প্রতিরোধ টিপস",
        waterTesting2: "জল পরীক্ষা",
        aboutTitle: "হিলিফাই সম্পর্কে",
        missionTitle: "আমাদের লক্ষ্য",
        missionText: "হিলিফাই উন্নত এআই এবং মেশিন লার্নিং প্রযুক্তির মাধ্যমে জনস্বাস্থ্য পর্যবেক্ষণে বিপ্লব ঘটাতে নিবেদিত। আমাদের লক্ষ্য হল একটি স্মার্ট স্বাস্থ্য নজরদারি ব্যবস্থা তৈরি করা যা গ্রামীণ উত্তর-পূর্ব ভারতের দুর্বল সম্প্রদায়গুলিতে জলবাহিত রোগের প্রাদুর্ভাব সনাক্ত, পর্যবেক্ষণ এবং প্রতিরোধ করে।",
        visionTitle: "আমাদের দৃষ্টি",
        visionText: "একটি ব্যাপক প্রারম্ভিক সতর্কতা ব্যবস্থা প্রতিষ্ঠা করা যা সম্প্রদায়, স্বাস্থ্যকর্মী এবং সরকারী কর্মকর্তাদেরকে জলবাহিত রোগের বিরুদ্ধে কার্যকরভাবে লড়াই করার জন্য রিয়েল-টাইম অন্তর্দৃষ্টি এবং কার্যকরী বুদ্ধিমত্তা দিয়ে শক্তিশালী করে।",
        techStack: "প্রযুক্তি স্ট্যাক",
        teamTitle: "আমাদের দল",
        critical: "সংকটজনক",
        high: "উচ্চ",
        medium: "মাঝারি",
        low: "নিম্ন",
        upcoming: "আসন্ন",
        registered: "নিবন্ধিত",
        registerNow: "এখন নিবন্ধন করুন",
        description: "বিবরণ",
        prevention: "প্রতিরোধ পদ্ধতি",
        reportedCases: "রিপোর্ট করা কেস",
        rate: "হার",
        cases: "কেস",
        location2: "অবস্থান",
        send: "প্রেরণ",
        aboutAI: "হিলিফাই এআই সম্পর্কে",
        aboutAIText: "আমাদের এআই সহকারী একাধিক ভাষায় জলবাহিত রোগ, প্রতিরোধ পদ্ধতি এবং স্বাস্থ্য সম্পদ সম্পর্কে আপনার প্রশ্নের তাত্ক্ষণিক উত্তর প্রদান করে।",
        symptomsTitle: "লক্ষণ:",
        preventionTitle: "প্রতিরোধ পদ্ধতি:",
        remediesTitle: "নিরাময় ও প্রতিকার",
        statistics: "প্রাদুর্ভাবের পরিসংখ্যান",
        probability: "ম্যাচ স্কোর",
        noDiseaseDetectedTitle: "কোনো নির্দিষ্ট রোগ সনাক্ত করা যায়নি",
        noDiseaseDetectedDescription: "লক্ষণগুলির সংমিশ্রণ আমাদের ডাটাবেসের কোনো একক জলবাহিত রোগের সাথে দৃঢ়ভাবে মেলে না। এটি কোনো অসুস্থতা বাতিল করে না।",
        noDiseaseDetectedRemedy: "সঠিক নির্ণয়ের জন্য অনুগ্রহ করে একজন স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন। আপনি হাইড্রেটেড আছেন তা নিশ্চিত করুন এবং আপনার লক্ষণগুলি পর্যবেক্ষণ করুন।",
        genderOptions: { male: "পুরুষ", female: "মহিলা", other: "অন্যান্য" },
        symptomsList: ["জ্বর", "ডায়রিয়া", "বমি", "পেটে ব্যথা", "ডিহাইড্রেশন", "মাথাব্যথা", "ক্লান্তি", "বমি বমি ভাব", "জন্ডিস", "গাঢ় রঙের প্রস্রাব", "গোলাপী দাগ", "পেট ফাঁপা", "ওজন হ্রাস"],
        diseases: {
            hepatitisA: { name: "হেপাটাইটিস এ", description: "হেপাটাইটিস এ ভাইরাস (HAV) দ্বারা সৃষ্ট একটি লিভারের সংক্রমণ, যা অত্যন্ত সংক্রাকক এবং দূষিত খাবার বা জলের মাধ্যমে ছড়ায়।", remedies: ["বিশ্রাম অপরিহার্য কারণ কোনো নির্দিষ্ট চিকিৎসা নেই।", "প্রচুর পরিমাণে তরল পান করে হাইড্রেটেড থাকুন।", "অ্যালকোহল এবং লিভারের ক্ষতি করতে পারে এমন ওষুধ এড়িয়ে চলুন।"] },
            cholera: { name: "কলেরা", description: "ভিব্রিও কলেরি ব্যাকটেরিয়া দ্বারা অন্ত্রের সংক্রমণের কারণে সৃষ্ট একটি তীব্র ডায়রিয়ার অসুস্থতা, যা গুরুতর হতে পারে।", remedies: ["ওরাল রিহাইড্রেশন সলিউশন (ORS) দিয়ে অবিলম্বে পুনরুদ দরকার।", "গুরুতর ক্ষেত্রে জরুরি চিকিৎসার সহায়তা নিন।", "জিঙ্ক সাপ্লিমেন্ট ডায়রিয়ার সময়কাল কমাতে সাহায্য করতে পারে।"] },
            gastroenteritis: { name: "গ্যাস্ট্রোএন্টারাইটিস (ডায়রিয়া)", description: "একটি অন্ত্রের সংক্রমণ যা জলীয় ডায়রিয়া, পেটে ব্যথা, বমি বমি ভাব বা বমি এবং কখনও কখনও জ্বর দ্বারা চিহ্নিত করা হয়।", remedies: ["ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন (ORS সেরা)।", "কলা, ভাত এবং টোস্টের মতো নরম খাবার খান (BRAT ডায়েট)।", "দুগ্ধজাত, চর্বিযুক্ত বা মশলাদার খাবার এড়িয়ে চলুন।"] },
            typhoid: { name: "টাইফয়েড জ্বর", description: "সালমোনেলা টাইফি দ্বারা সৃষ্ট একটি গুরুতর ব্যাকটেরিয়া সংক্রমণ, যা একটি স্থায়ী উচ্চ জ্বর দ্বারা চিহ্নিত করা হয়।", remedies: ["অবিলম্বে চিকিৎসার প্রয়োজন এবং এটি অ্যান্টিবায়োটিক দিয়ে চিকিৎসা করা হয়।", "ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন।", "একটি উচ্চ-ক্যালোরি, পুষ্টিকর খাদ্য গ্রহণ করুন।"] },
            giardiasis: { name: "জিয়ার্ডিয়াসিস", description: "জিয়ার্ডিয়া ল্যাম্বলিয়া নামক একটি আণুবীক্ষণিক পরজীবী দ্বারা সৃষ্ট একটি অন্ত্রের সংক্রমণ, যা প্রায়শই জ্বর ছাড়াই পেট ফাঁপা এবং ব্যথার কারণ হয়।", remedies: ["সাধারণত প্রেসক্রিপশন ওষুধের সাথে চিকিৎসা প্রয়োজন।", "ভালভাবে হাইড্রেটেড থাকুন।", "ক্যাফিন এবং দুগ্ধজাত পণ্য এড়িয়ে চলুন, যা ডায়রিয়াকে আরও খারাপ করতে পারে।"] },
            crypto: { name: "ক্রিপ্টোস্পোরিডিওসিস", description: "আণুবীক্ষণিক পরজীবী ক্রিপ্টোস্পোরিডিয়াম দ্বারা সৃষ্ট একটি ডায়রিয়ার রোগ। এটি জলীয় ডায়রিয়ার কারণ হতে পারে এবং এটি জলবাহিত রোগের একটি সাধারণ কারণ।", remedies: ["বেশিরভাগ লোক চিকিৎসা ছাড়াই সুস্থ হয়ে ওঠে।", "ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন।", "অ্যান্টি-ডায়রিয়াল ওষুধ সাহায্য করতে পারে, তবে প্রথমে একজন ডাক্তারের সাথে পরামর্শ করুন।"] }
        },
        ai: {
            initialGreeting: "নমস্কার! আমি হিলিফাই এআই। আমি আজ আপনাকে জলবাহিত রোগ সম্পর্কে কীভাবে সহায়তা করতে পারি? আপনি আমাকে জিজ্ঞাসা করতে পারেন 'কলেরার কারণ কী?' বা 'টাইফয়েড কীভাবে প্রতিরোধ করা যায়?'",
            fallback: "আমি দুঃখিত, আমার কাছে সেই বিষয়ে তথ্য নেই। আমি কলেরা, টাইফয়েড, হেপাটাইটিস এ, জিয়ার্ডিয়াসিস এবং গ্যাস্ট্রোএন্টারাইটিসের মতো রোগের কারণ, লক্ষণ, চিকিৎসা এবং প্রতিরোধ সম্পর্কে প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে আপনার প্রশ্নটি ভিন্নভাবে জিজ্ঞাসা করার চেষ্টা করুন।",
        }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    
    const resolve = (languageObject, keyParts) => {
      let current = languageObject;
      for (const part of keyParts) {
        if (current === undefined || typeof current !== 'object' || current === null) {
          return undefined;
        }
        current = current[part];
      }
      return current;
    };

    let result = resolve(translations[language], keys);

    if (result === undefined && language !== 'en') {
      result = resolve(translations['en'], keys);
    }

    return result !== undefined ? result : key;
  };
    
  useEffect(() => {
    setMessages([
        {  
            id: 1,  
            text: t('ai.initialGreeting'),  
            sender: 'ai',  
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  
        }
    ]);
  }, [language, t]);

  // ✨ NEW: Enhanced AI Knowledge Base
  const diseaseInfoDatabase = {
    hepatitisA: {
        name: "Hepatitis A",
        keywords: ["hepatitis", "jaundice", "hav"],
        info: {
            causes: "Hepatitis A is caused by the Hepatitis A virus (HAV). It's typically transmitted through consuming food or water contaminated with fecal matter from an infected person.",
            symptoms: "Key symptoms are fever, fatigue, loss of appetite, nausea, abdominal pain, dark urine, and jaundice (yellowing of the skin and eyes).",
            treatment: "There is no specific treatment for Hepatitis A. The body usually clears the virus on its own. Doctors recommend rest, adequate nutrition, and plenty of fluids. It's vital to avoid alcohol.",
            prevention: "The best prevention is the Hepatitis A vaccine. Also, always wash your hands with soap and water after using the bathroom and before preparing food. Drink only purified or boiled water."
        }
    },
    cholera: {
        name: "Cholera",
        keywords: ["cholera"],
        info: {
            causes: "Cholera is caused by the bacterium Vibrio cholerae, which is found in water or food sources contaminated by feces from an infected person.",
            symptoms: "The hallmark symptom is profuse watery diarrhea, often described as 'rice-water stools'. Other symptoms include vomiting and leg cramps. It leads to rapid dehydration.",
            treatment: "Immediate rehydration is critical. This is done using Oral Rehydration Solution (ORS). In severe cases, intravenous fluids and antibiotics are required. See a doctor immediately.",
            prevention: "Prevention relies on ensuring access to clean, safe drinking water and proper sanitation. Boiling or treating water before use is essential in high-risk areas."
        }
    },
    gastroenteritis: {
        name: "Gastroenteritis",
        keywords: ["gastroenteritis", "diarrhea", "stomach flu", "loose motion"],
        info: {
            causes: "Gastroenteritis, or infectious diarrhea, can be caused by various viruses (like rotavirus and norovirus), bacteria, or parasites. It spreads through contaminated food or water, or contact with an infected person.",
            symptoms: "Common symptoms include watery diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever. Dehydration is a major concern.",
            treatment: "Treatment focuses on preventing dehydration by drinking plenty of fluids, especially ORS. Eat bland foods (like bananas, rice, toast). Most cases resolve on their own.",
            prevention: "Frequent and thorough handwashing is the best way to prevent it. Also, ensure food is cooked properly and avoid consuming untreated water."
        }
    },
    typhoid: {
        name: "Typhoid Fever",
        keywords: ["typhoid", "enteric fever"],
        info: {
            causes: "Typhoid fever is caused by the bacterium Salmonella Typhi. It is spread through contaminated food and water, and by close contact with an infected person.",
            symptoms: "It is characterized by a sustained high fever that can reach 104°F (40°C). Other symptoms include headache, weakness, stomach pain, and sometimes a rash of flat, rose-colored spots.",
            treatment: "Typhoid requires prompt treatment with antibiotics prescribed by a doctor. Without treatment, it can be fatal.",
            prevention: "Vaccination is available and recommended for people in high-risk areas. Always drink safe water, avoid raw food from street vendors, and practice good hand hygiene."
        }
    },
    giardiasis: {
        name: "Giardiasis",
        keywords: ["giardiasis", "giardia"],
        info: {
            causes: "This intestinal infection is caused by a microscopic parasite called Giardia lamblia. It is found in contaminated water, food, or soil and can be transmitted from person to person.",
            symptoms: "Symptoms can include watery diarrhea, gas, greasy stools that tend to float, stomach cramps, and dehydration. Some people have no symptoms.",
            treatment: "A doctor will prescribe specific anti-parasitic medications to treat Giardiasis.",
            prevention: "Avoid swallowing water from pools, lakes, or streams. Practice good hygiene, especially handwashing. Peel or wash raw fruits and vegetables before eating."
        }
    },
    crypto: {
        name: "Cryptosporidiosis",
        keywords: ["cryptosporidiosis", "crypto"],
        info: {
            causes: "Cryptosporidiosis is caused by the microscopic parasite Cryptosporidium. It is a common cause of waterborne disease and can be found in water, food, soil, or on surfaces contaminated with the feces of an infected human or animal.",
            symptoms: "The primary symptom is watery diarrhea. Other symptoms include stomach cramps, dehydration, nausea, vomiting, fever, and weight loss.",
            treatment: "Most people with a healthy immune system recover without treatment. The focus is on drinking plenty of fluids to prevent dehydration. A doctor may prescribe anti-diarrheal medicine.",
            prevention: "Good hygiene, including thorough handwashing, is key. Do not swallow water when swimming in public pools or natural bodies of water."
        }
    }
  };


  // ✨ REVISED: More intelligent AI response function
  const getAIResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    // Keyword sets for different question types
    const greetingKeywords = ["hello", "hi", "hey", "namaste"];
    const causesKeywords = ["cause", "from", "get", "origin", "reason", "why"];
    const symptomsKeywords = ["symptom", "sign", "feel", "effect", "identify"];
    const treatmentKeywords = ["treat", "cure", "remedy", "help", "solution", "manage"];
    const preventionKeywords = ["prevent", "avoid", "safe", "stop", "protect"];

    // 1. Handle Greetings
    if (greetingKeywords.some(k => lowerCaseMessage.includes(k))) {
        return "Hello there! How can I help you learn about waterborne diseases today?";
    }

    // 2. Identify Disease and Question Type
    for (const diseaseKey in diseaseInfoDatabase) {
        const disease = diseaseInfoDatabase[diseaseKey];
        if (disease.keywords.some(k => lowerCaseMessage.includes(k))) {
            // Disease identified, now find the question type
            if (symptomsKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Symptoms of ${disease.name}: ${disease.info.symptoms}`;
            }
            if (causesKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Causes of ${disease.name}: ${disease.info.causes}`;
            }
            if (treatmentKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Treatment for ${disease.name}: ${disease.info.treatment}`;
            }
            if (preventionKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Prevention of ${disease.name}: ${disease.info.prevention}`;
            }
            // If just the disease name is mentioned, give a summary
            return `${disease.name}: ${t(`diseases.${diseaseKey}`).description} Would you like to know about its causes, symptoms, treatment, or prevention?`;
        }
    }

    // 3. Handle Generic Prevention/Symptom Questions
    if (preventionKeywords.some(k => lowerCaseMessage.includes(k))) {
      return "To prevent most waterborne diseases, always drink boiled or purified water, wash your hands thoroughly with soap, cook food properly, and avoid swallowing water from pools or lakes.";
    }
    if (symptomsKeywords.some(k => lowerCaseMessage.includes(k))) {
      return "Common symptoms for many waterborne diseases include diarrhea, vomiting, fever, and stomach cramps. For a more specific diagnosis, please use the 'Disease Prediction' tab or consult a doctor.";
    }

    // 4. Fallback response
    return t('ai.fallback');
  };


  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage = { id: Date.now(), text: userMessage, sender: 'user', timestamp };
    setMessages(prev => [...prev, newUserMessage]);
    const aiResponseText = getAIResponse(userMessage);
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, text: aiResponseText, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
    setUserMessage('');
  };

  useEffect(() => {
      if (mainChatRef.current) {
          mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
      }
      if (widgetChatRef.current) {
          widgetChatRef.current.scrollTop = widgetChatRef.current.scrollHeight;
      }
  }, [messages]);
  
  const diseaseDatabase = {
    hepatitisA: { keywords: ["Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Abdominal Pain", "Vomiting", "Fever"], },
    cholera: { keywords: ["Diarrhea", "Vomiting", "Dehydration", "Nausea"], },
    gastroenteritis: { keywords: ["Diarrhea", "Vomiting", "Nausea", "Abdominal Pain", "Fever", "Dehydration", "Headache"], },
    typhoid: { keywords: ["Fever", "Headache", "Fatigue", "Abdominal Pain", "Rose spots", "Diarrhea"], },
    giardiasis: { keywords: ["Diarrhea", "Fatigue", "Abdominal Pain", "Nausea", "Dehydration", "Bloating", "Weight loss"], },
    crypto: { keywords: ["Diarrhea", "Dehydration", "Weight loss", "Abdominal Pain", "Fever", "Nausea", "Vomiting"], }
  };

  const runAIAnalysis = (selectedSymptoms) => {
    const translatedSymptomsList = t('symptomsList');
    // Important: Always compare against the English keywords in the database
    const englishSelectedSymptoms = selectedSymptoms.map(symptom => {
        const index = translatedSymptomsList.indexOf(symptom);
        return translations['en'].symptomsList[index];
    });
    let scores = [];
    for (const diseaseKey in diseaseDatabase) {
        const disease = diseaseDatabase[diseaseKey];
        const matchingSymptoms = disease.keywords.filter(keyword => englishSelectedSymptoms.includes(keyword));
        if (matchingSymptoms.length > 0) {
            const score = Math.round((matchingSymptoms.length / disease.keywords.length) * 100);
            if (score > 20) {
                scores.push({
                    ...t(`diseases.${diseaseKey}`),
                    probability: score,
                });
            }
        }
    }
    scores.sort((a, b) => b.probability - a.probability);
    return scores.length > 0 ? scores.slice(0, 3) : [];
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.symptoms.length === 0) {
      alert('Please select at least one symptom for analysis.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      const results = runAIAnalysis(formData.symptoms);
      setAnalysisResult(results);
      setIsAnalyzing(false);
    }, 2500);
  };
  
  const handleWaterFormSubmit = async (e) => {
    e.preventDefault();
    setIsWaterAnalyzing(true);
    setWaterAnalysisResult(null);
    setWaterAnalysisError(null);

    const API_URL = 'https://karan0301-sih.hf.space/predict';

    const submissionData = {
    ph_level: parseFloat(waterFormData.ph),
    turbidity_ntu: parseFloat(waterFormData.turbidity),
    contaminant_level_ppm: parseFloat(waterFormData.contaminantLevel),
    temperature_celsius: parseFloat(waterFormData.temperature),
    water_source_type: waterFormData.water_source_type,
    bacteria_count_cfu_ml: parseFloat(waterFormData.bacteria_count_cfu_ml),     // NEW
    nitrate_level_mg_l: parseFloat(waterFormData.nitrate_level_mg_l),         // NEW
    dissolved_oxygen_mg_l: parseFloat(waterFormData.dissolved_oxygen_mg_l)    // NEW
};
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setWaterAnalysisResult(result);
        console.log("API Response:", result);

    } catch (error) {
        console.error("API call failed:", error);
        setWaterAnalysisError(`Failed to get analysis. ${error.message}`);
    } finally {
        setIsWaterAnalyzing(false);
    }
  };

  const handleWaterInputChange = (e) => {
    const { name, value } = e.target;
    setWaterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setWaterFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prev => {
      const symptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  };

  const toggleChat = () => setChatOpen(!chatOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-dark', 'text-light');
    } else {
      document.body.classList.remove('bg-dark', 'text-light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const diseaseOutbreaks = [
    { id: 1, name: t('outbreakTitle'), state: 'Assam', cases: 45000, rate: 18.5, severity: 'critical', position: [26.2006, 92.9376], healthContact: "104", nearbyHospitals: 15, latestNews: "Govt. launches new initiative for clean drinking water in rural Assam." },
    { id: 2, name: 'Cholera Outbreak', state: 'Meghalaya', cases: 32000, rate: 16.2, severity: 'high', position: [25.4670, 91.3662], healthContact: "108", nearbyHospitals: 8, latestNews: "Health department issues high alert following flash floods in Garo Hills." },
    { id: 3, name: 'Typhoid Outbreak', state: 'Manipur', cases: 28000, rate: 15.8, severity: 'medium', position: [24.6637, 93.9063], healthContact: "102", nearbyHospitals: 11, latestNews: "Vaccination drive for Typhoid begins in Imphal and surrounding areas." },
    { id: 4, name: 'Hepatitis Outbreak', state: 'Nagaland', cases: 25000, rate: 14.7, severity: 'low', position: [26.1584, 94.5624], healthContact: "103", nearbyHospitals: 7, latestNews: "Awareness campaigns about contaminated water sources are underway." },
    { id: 5, name: 'Gastroenteritis', state: 'Arunachal Pradesh', cases: 18000, rate: 12.3, severity: 'medium', position: [28.2180, 94.7278], healthContact: "108", nearbyHospitals: 5, latestNews: "Mobile medical units dispatched to remote eastern districts." }
  ];

  const communityEvents = [
    { id: 1, title: 'Online Health Webinar', type: 'online', platform: 'Zoom', date: 'October 20, 2025', time: '3:00 PM - 5:00 PM', description: t('communitySubtitle'), attendees: 250, status: 'upcoming' },
    { id: 2, title: 'Rural Health Camp', type: 'offline', venue: 'Tura Community Center, Meghalaya', date: 'November 5, 2025', time: '9:00 AM - 3:00 PM', description: 'Free health checkups and water quality testing.', attendees: 85, status: 'upcoming' },
    { id: 3, title: 'Water Quality Workshop', type: 'online', platform: 'Microsoft Teams', date: 'November 15, 2025', time: '11:00 AM - 1:00 PM', description: 'Virtual training session on water purification.', attendees: 180, status: 'upcoming' },
    { id: 4, title: 'Village Health Screening', type: 'offline', venue: 'Kohima School Complex, Nagaland', date: 'December 2, 2025', time: '8:00 AM - 2:00 PM', description: 'Special health camp focusing on pediatric waterborne diseases.', attendees: 200, status: 'upcoming' }
  ];

  const northeastStats = [
    { state: 'Assam', cases: 45000, rate: 18.5 },
    { state: 'Meghalaya', cases: 32000, rate: 16.2 },
    { state: 'Manipur', cases: 28000, rate: 15.8 },
    { state: 'Nagaland', cases: 25000, rate: 14.7 },
    { state: 'Arunachal Pradesh', cases: 18000, rate: 12.3 }
  ];

  const diseaseTrends = [
    { month: 'Jan', diarrhea: 120, cholera: 85, typhoid: 65, hepatitis: 45 },
    { month: 'Feb', diarrhea: 150, cholera: 95, typhoid: 75, hepatitis: 55 },
    { month: 'Mar', diarrhea: 200, cholera: 120, typhoid: 100, hepatitis: 70 },
    { month: 'Apr', diarrhea: 280, cholera: 180, typhoid: 150, hepatitis: 110 },
    { month: 'May', diarrhea: 350, cholera: 220, typhoid: 180, hepatitis: 140 },
    { month: 'Jun', diarrhea: 420, cholera: 280, typhoid: 220, hepatitis: 180 },
    { month: 'Jul', diarrhea: 500, cholera: 350, typhoid: 280, hepatitis: 230 },
    { month: 'Aug', diarrhea: 480, cholera: 320, typhoid: 260, hepatitis: 210 },
    { month: 'Sep', diarrhea: 400, cholera: 280, typhoid: 220, hepatitis: 180 },
    { month: 'Oct', diarrhea: 320, cholera: 220, typhoid: 180, hepatitis: 150 },
    { month: 'Nov', diarrhea: 200, cholera: 150, typhoid: 120, hepatitis: 90 },
    { month: 'Dec', diarrhea: 150, cholera: 100, typhoid: 80, hepatitis: 60 }
  ];

  const teamMembers = [
    { name: "Abhimanyu" }, { name: "Siddharth" }, { name: "Rudra" }, { name: "Karan" }, { name: "Ananya" }, { name: "Rohan" }
  ];

  return (
    <div className={`${darkMode ? 'bg-dark text-light' : 'bg-light'} min-vh-100`}>
      <header className={`shadow sticky-top ${darkMode ? 'bg-dark' : 'bg-white'}`}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <button 
                className="hamburger-btn btn me-3" 
                onClick={toggleSidebar} 
                aria-label={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"} 
                style={{ color: darkMode ? 'white' : 'black' }}
              >
                {sidebarOpen ? <FaTimes size={20} aria-hidden="true" /> : <FaBars size={20} aria-hidden="true" />}
              </button>

              <div className="me-2" style={{ width: '40px', height: '40px', background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="text-white" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="h4 fw-bold mb-0">HEALIFY</h1>
            </div>
            <button 
              className="btn"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{ color: darkMode ? 'white' : 'black' }}
            >
              {darkMode 
                ? <FaSun size={20} aria-hidden="true" /> 
                : <FaMoon size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      
      <div className="d-flex">
        <aside 
          className="sidebar shadow position-fixed"
          style={{ 
            width: '256px', 
            height: '100vh', 
            top: '0',
            left: sidebarOpen ? '0' : '-256px',
            backgroundColor: darkMode ? '#2d2d2d' : 'white',
            transition: 'left 0.3s ease',
            zIndex: 1000,
            paddingTop: '70px'
          }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center mb-3">
              <div className="me-2" style={{ width: '30px', height: '30px', background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="text-white" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-0">HEALIFY</h2>
            </div>
          </div>
          <nav className="p-3">
            <ul className="list-unstyled">
              <li>
               <button 
                  onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
                  aria-label="Go to Home tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'home' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaHome className="me-2" aria-hidden="true" /> {t('home')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('waterData'); setSidebarOpen(false); }}
                  aria-label="Go to Submit Data tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'waterData' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaDatabase className="me-2" aria-hidden="true" /> {t('submitWaterData')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('prediction'); setSidebarOpen(false); }}
                  aria-label="Go to Disease Prediction tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'prediction' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaStethoscope className="me-2" aria-hidden="true" /> {t('diseasePrediction')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('community'); setSidebarOpen(false); }}
                  aria-label="Go to Community tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'community' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaUsers className="me-2" aria-hidden="true" /> {t('community')}
                </button>
              </li>
              <li>
               <button 
                  onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
                  aria-label="Go to AI Assistant chat tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'chat' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaRobot className="me-2" aria-hidden="true" /> {t('aiAssistant')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('about'); setSidebarOpen(false); }}
                  aria-label="Go to About tab"
                  className={`w-100 text-start btn mb-2 ${activeTab === 'about' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaInfoCircle className="me-2" aria-hidden="true" /> {t('about')}
                </button>
              </li>
              <li className="mt-3">
                <div className="d-flex align-items-center mb-2">
                  <FaGlobe className="me-2" />
                  <span className="fw-bold">{t('language')}</span>
                </div>
                <div className="d-grid gap-2">
                  <button onClick={() => setLanguage('en')} className={`btn btn-sm w-100 ${language === 'en' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>{t('english')}</button>
                  <button onClick={() => setLanguage('hi')} className={`btn btn-sm w-100 ${language === 'hi' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>{t('hindi')}</button>
                  <button onClick={() => setLanguage('as')} className={`btn btn-sm w-100 ${language === 'as' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>{t('assamese')}</button>
                  <button onClick={() => setLanguage('bn')} className={`btn btn-sm w-100 ${language === 'bn' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>{t('bengali')}</button>
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        <main 
          style={{ marginLeft: '0', padding: '24px', width: '100%', transition: 'margin-left 0.3s ease' }} 
          className={darkMode ? 'text-light' : ''}
        >
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card text-white mb-4" style={{ background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '1rem' }}>
                <div className="card-body p-5">
                  <h2 className="card-title h1 fw-bold">{t('heroTitle')}</h2>
                  <p className="card-text fs-4 opacity-75 mb-4">{t('heroSubtitle')}</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark bg-opacity-25">AI-Powered Detection</span>
                    <span className="badge bg-light text-dark bg-opacity-25">Real-Time Alerts</span>
                    <span className="badge bg-light text-dark bg-opacity-25">Northeast Focus</span>
                  </div>
                </div>
              </div>

              <OutbreakMap outbreaks={diseaseOutbreaks} darkMode={darkMode} />

              <div className="row mb-4">
                <div className="col-lg-6 mb-3">
                  <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                    <div className="card-body">
                      <h3 className="card-title h5 fw-bold mb-3">{t('statisticsTitle')}</h3>
                      <div style={{ width: "100%", minHeight: "400px" }}>
                        <ResponsiveContainer  width="100%" height={400}>
                          <BarChart data={northeastStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="state" stroke={darkMode ? 'white' : 'black'} />
                            <YAxis stroke={darkMode ? 'white' : 'black'} />
                            <Tooltip content={<HealthTooltip />} />
                            <Legend />
                            <Bar dataKey="cases" fill="#0D6EFD" name={t('cases')} />
                            <Bar dataKey="rate" fill="#198754" name={`${t('rate')} per 1000`} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-3">
                  <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                    <div className="card-body">
                      <h3 className="card-title h5 fw-bold mb-3">{t('trendsTitle')}</h3>
                      <div style={{ width: "100%", minHeight: "400px" }}>
                        <ResponsiveContainer  width="100%" height={400}>
                          <LineChart data={diseaseTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="month" stroke={darkMode ? 'white' : 'black'} />
                            <YAxis stroke={darkMode ? 'white' : 'black'} />
                            <Tooltip content={<HealthTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="diarrhea" stroke="#ef4444" name="Diarrhea" />
                            <Line type="monotone" dataKey="cholera" stroke="#f59e0b" name="Cholera" />
                            <Line type="monotone" dataKey="typhoid" stroke="#059669" name="Typhoid" />
                            <Line type="monotone" dataKey="hepatitis" stroke="#7c3aed" name="Hepatitis" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`card mb-4 ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                <div className="card-body">
                  <h3 className="card-title h4 fw-bold mb-4">{t('emergencyTitle')}</h3>
                  <div className="table-responsive">
                    <table className={`table ${darkMode ? 'table-dark' : 'table-hover'}`}>
                      <thead>
                        <tr>
                          <th>{t('disease')}</th>
                          <th>{t('state')}</th>
                          <th>{t('severity')}</th>
                          <th>{t('responseTeam')}</th>
                          <th>{t('lastUpdate')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="badge bg-danger">Diarrhea</span></td>
                          <td>Assam</td>
                          <td><span className="badge bg-danger">{t('critical')}</span></td>
                          <td>Deployed</td>
                          <td>2 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-warning text-dark">Cholera</span></td>
                          <td>Meghalaya</td>
                          <td><span className="badge bg-warning text-dark">{t('high')}</span></td>
                          <td>En Route</td>
                          <td>4 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-info text-dark">Typhoid</span></td>
                          <td>Manipur</td>
                          <td><span className="badge bg-info text-dark">{t('medium')}</span></td>
                          <td>Assessing</td>
                          <td>6 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-secondary">Hepatitis</span></td>
                          <td>Nagaland</td>
                          <td><span className="badge bg-secondary">{t('low')}</span></td>
                          <td>Monitoring</td>
                          <td>8 hours ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'waterData' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                <div className="card-body p-5">
                  <div className="row">
                   
                    <div className="col-lg-7">
                      <h2 className="card-title h3 fw-bold mb-4">{t('waterQuality')}</h2>
                      <p className={`mb-4 ${darkMode ? 'text-light-50' : 'text-muted'}`}>Submit the following parameters for a detailed analysis of your water source.</p>
                      <form onSubmit={handleWaterFormSubmit}>
                          <div className="row">
                            <div className="col-md-12 mb-3">
                                <label htmlFor="water_source_type" className="form-label">{t('waterSourceType')}</label>
                                <select 
                                  id="water_source_type" 
                                  name="water_source_type" 
                                  className={`form-select ${darkMode ? 'bg-dark text-light' : ''}`} 
                                  value={waterFormData.water_source_type} 
                                  onChange={handleWaterInputChange}
                                >
                                  <option>River</option>
                                  <option>Well</option>
                                  <option>Lake</option>
                                  <option>Tap Water</option>
                                  <option>Borehole</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label htmlFor="bacteria_count_cfu_ml" className="form-label">Bacteria Count (CFU/mL)</label>
                                <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="bacteria_count_cfu_ml" name="bacteria_count_cfu_ml" value={waterFormData.bacteria_count_cfu_ml} onChange={handleWaterInputChange} />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label htmlFor="nitrate_level_mg_l" className="form-label">Nitrate Level (mg/L)</label>
                                <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="nitrate_level_mg_l" name="nitrate_level_mg_l" value={waterFormData.nitrate_level_mg_l} onChange={handleWaterInputChange} />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label htmlFor="dissolved_oxygen_mg_l" className="form-label">Dissolved Oxygen (mg/L)</label>
                                <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="dissolved_oxygen_mg_l" name="dissolved_oxygen_mg_l" value={waterFormData.dissolved_oxygen_mg_l} onChange={handleWaterInputChange} />
                              </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="ph" className="form-label">{t('pH')}</label>
                              <input type="number" step="0.1" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="ph" name="ph" value={waterFormData.ph} onChange={handleWaterInputChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="turbidity" className="form-label">{t('turbidity')}</label>
                              <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="turbidity" name="turbidity" value={waterFormData.turbidity} onChange={handleWaterInputChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="contaminantLevel" className="form-label">{t('contaminantLevelPpm')}</label>
                              <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="contaminantLevel" name="contaminantLevel" value={waterFormData.contaminantLevel} onChange={handleWaterInputChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="temperature" className="form-label">{t('waterTemperatureC')}</label>
                              <input type="number" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="temperature" name="temperature" value={waterFormData.temperature} onChange={handleWaterInputChange} />
                            </div>
                            <div className="col-md-12 mb-3">
                              <label htmlFor="file" className="form-label">{t('upload')} (Optional)</label>
                              <input type="file" className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} id="file" name="file" onChange={handleFileChange} />
                            </div>
                          </div>
                          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isWaterAnalyzing}>
                            {isWaterAnalyzing ? 'Analyzing...' : t('submitButton')}
                          </button>
                      </form>
                    </div>

                    <div className="col-lg-5">
                      <h3 className="h5 fw-bold mb-3">{t('analysisTitle')}</h3>
                        <div className={`p-4 d-flex align-items-center justify-content-center text-center ${darkMode ? 'bg-dark border border-secondary' : 'bg-light'}`} style={{ minHeight: '450px', borderRadius: '0.5rem' }}>
                          {isWaterAnalyzing ? (
                            <div>
                              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                              <p className="mt-3">Contacting server for analysis...</p>
                            </div>
                          ) : waterAnalysisError ? (
                              <div className="alert alert-danger mx-3">{waterAnalysisError}</div>
                          ) : waterAnalysisResult ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <h4 className="fw-bold">Outbreak Prediction</h4>
                              <p className={`display-4 fw-bold my-3 ${waterAnalysisResult.risk_level === 'High' ? 'text-danger' : 'text-success'}`}>
                                {waterAnalysisResult.risk_level} Risk
                              </p>
                              <div className="mt-4">
                                <p className="mb-1"><strong>Model Used:</strong> <span className="text-capitalize">{waterAnalysisResult.model_used.replace('_outbreak', '')}</span></p>
                                {waterAnalysisResult.probability && (
                                  <p><strong>Confidence:</strong> <span className="badge bg-info text-dark fs-6">{`${(waterAnalysisResult.probability * 100).toFixed(1)}%`}</span></p>
                                )}
                              </div>
                            </motion.div>
                          ) : (
                              <div className="text-muted"><p>{t('analysisPlaceholder')}</p></div>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'prediction' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5">
                <h2 className="card-title h3 fw-bold mb-4">{t('predictionTitle')}</h2>
                <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>{t('predictionSubtitle')}</p>
                <div className="row">
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('patientInfo')}</h3>
                    <form onSubmit={handleFormSubmit}>
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('fullName')}</label>
                        <input 
                          type="text" 
                          className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t('fullName')} 
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('age')}</label>
                          <input 
                            type="number" 
                            className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder={t('age')} 
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('gender')}</label>
                          <select 
                            className={`form-select ${darkMode ? 'bg-dark text-light' : ''}`} 
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          >
                            <option value="">{t('gender')}</option>
                            <option value="male">{t('genderOptions').male}</option>
                            <option value="female">{t('genderOptions').female}</option>
                            <option value="other">{t('genderOptions').other}</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('location')}</label>
                        <input 
                          type="text" 
                          className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder={t('location')} 
                        />
                      </div>
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('symptoms')}</label>
                        <div className="row" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          {t('symptomsList').map((symptom, index) => (
                            <div key={index} className="col-md-6 mb-2">
                              <div className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  checked={formData.symptoms.includes(symptom)}
                                  onChange={() => handleSymptomChange(symptom)}
                                />
                                <label className={`form-check-label ${darkMode ? 'text-light' : ''}`}>{symptom}</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary w-100" disabled={isAnalyzing}>
                         {isAnalyzing ? t('analyzingPlaceholder') : t('submitButton')}
                      </button>
                    </form>
                  </div>
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('analysisTitle')}</h3>
                    <div className={`p-4 ${darkMode ? 'bg-dark border border-secondary' : 'bg-light'}`} style={{ minHeight: '500px', borderRadius: '0.5rem', overflowY: 'auto' }}>
                      {isAnalyzing ? (
                          <div className="text-center d-flex flex-column justify-content-center h-100">
                           <div className="spinner-border text-primary mx-auto" role="status">
                             <span className="visually-hidden">Loading...</span>
                           </div>
                           <p className="mt-3">{t('analyzingPlaceholder')}</p>
                         </div>
                      ) : analysisResult && analysisResult.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {analysisResult.map((result, index) => (
                                <div key={index} className={`mb-4 p-3 rounded ${darkMode ? 'bg-secondary' : 'border'}`}>
                                    <h4 className="text-primary fw-bold">{result.name}</h4>
                                    <p><strong>{t('probability')}:</strong> <span className="badge bg-info text-dark">{result.probability}% Match</span></p>
                                    <p className="mt-3">{result.description}</p>
                                    <h5 className="mt-4 fw-bold">{t('remediesTitle')}</h5>
                                    <ul className="list-group list-group-flush">
                                        {result.remedies.map((remedy, i) => (
                                        <li key={i} className={`list-group-item ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}>
                                            - {remedy}
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                             <div className="alert alert-warning mt-4 small">
                                 <strong>Disclaimer:</strong> This is an AI-generated preliminary analysis and not a substitute for professional medical advice. Please consult a qualified doctor for an accurate diagnosis.
                             </div>
                        </motion.div>
                      ) : analysisResult && analysisResult.length === 0 ? (
                         <div className="text-center d-flex flex-column justify-content-center h-100">
                           <h4 className="text-warning fw-bold">{t('noDiseaseDetectedTitle')}</h4>
                           <p className="mt-3">{t('noDiseaseDetectedDescription')}</p>
                           <p><strong>{t('remediesTitle')}:</strong> {t('noDiseaseDetectedRemedy')}</p>
                         </div>
                      ) : (
                        <div className="text-center d-flex flex-column justify-content-center h-100">
                            <svg className="text-primary mb-3 mx-auto" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className={darkMode ? 'text-light' : 'text-muted'}>{t('analysisPlaceholder')}</p>
                            <p className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>Select symptoms and submit to see results.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}
          
          {activeTab === 'community' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                <div className="card-body p-5">
                  <h2 className="card-title h3 fw-bold mb-4">{t('communityTitle')}</h2>
                  <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>{t('communitySubtitle')}</p>
                  <div className="row">
                    <div className="col-lg-8">
                      <h3 className="h5 fw-bold mb-3">{t('eventsTitle')}</h3>
                      {communityEvents.map(event => (
                        <div key={event.id} className={`card mb-3 ${darkMode ? 'bg-dark border-secondary' : ''}`}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h4 className="card-title h5 fw-bold">{event.title}</h4>
                                <p className={`mb-2 ${darkMode ? 'text-light' : 'text-muted'}`}>{event.type === 'online' ? event.platform : event.venue}</p>
                                <p className={`mb-2 ${darkMode ? 'text-light' : ''}`}>{event.date} at {event.time}</p>
                                <p className={`mb-3 ${darkMode ? 'text-light' : ''}`}>{event.description}</p>
                              </div>
                              <span className={`badge ${event.status === 'upcoming' ? 'bg-success' : 'bg-secondary'}`}>{t('upcoming')}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={darkMode ? 'text-light' : 'text-muted'}>{event.attendees} {t('registered')}</span>
                              <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'} btn-sm`}>{t('registerNow')}</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-lg-4">
                      <h3 className="h5 fw-bold mb-3">{t('programHighlights')}</h3>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <h5 className="card-title h6 fw-bold">{t('onlinePrograms')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Webinars and virtual workshops</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <h5 className="card-title h6 fw-bold">{t('offlineEvents')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Health camps and field visits</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <h5 className="card-title h6 fw-bold">{t('waterTesting')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Quality assessment and purification</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'chat' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-4">
                <h2 className="card-title h3 fw-bold mb-4">{t('chatTitle')}</h2>
                <div className="row">
                  <div className="col-lg-8">
                    <div className={`card h-100 ${darkMode ? 'bg-dark' : ''}`} style={{ height: '500px' }}>
                      <div ref={mainChatRef} className="card-body p-3" style={{ overflowY: 'auto', height: '400px' }}>
                        {messages.map((msg) => (
                          <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            {msg.sender === 'ai' && <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />}
                            <div style={{ maxWidth: '70%' }}>
                                <div className={`p-3 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : darkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`}>
                                    <p className="mb-0">{msg.text}</p>
                                </div>
                                <div className={`text-muted small mt-1 ${msg.sender === 'user' ? 'text-end' : 'text-start'}`}>{msg.timestamp}</div>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="d-flex justify-content-start mb-3">
                            <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                              <div className="d-flex">
                                <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite' }}></div>
                                <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.15s' }}></div>
                                <div className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.3s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-footer p-3">
                        <div className="input-group">
                          <input
                            type="text" value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={t('chatPlaceholder')}
                            className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                          />
                          <button onClick={handleSendMessage} disabled={!userMessage.trim()} className="btn btn-primary">
                            {t('send')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h3 className="h5 fw-bold mb-3">{t('chatFeatures')}</h3>
                    <div className={`card mb-3 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title h6 fw-bold">{t('quickHelp')}</h5>
                        <ul className={`list-group list-group-flush ${darkMode ? 'bg-dark' : ''}`}>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>{t('diseaseSymptoms')}</li>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>{t('preventionTips')}</li>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>{t('waterTesting2')}</li>
                        </ul>
                      </div>
                    </div>
                    <div className={`card ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title h6 fw-bold">{t('aboutAI')}</h5>
                        <p className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('aboutAIText')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}
          
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5">
                <h2 className="card-title h3 fw-bold mb-4">{t('aboutTitle')}</h2>
                <div className="row">
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('missionTitle')}</h3>
                    <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>{t('missionText')}</p>
                    <h3 className="h5 fw-bold mb-3">{t('visionTitle')}</h3>
                    <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>{t('visionText')}</p>
                    <h3 className="h5 fw-bold mb-3">{t('techStack')}</h3>
                    <ul className="list-group list-group-flush">
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>AI/ML Models</li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>IoT sensors</li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>Mobile applications</li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>Real-time alert system</li>
                    </ul>
                  </div>
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('teamTitle')}</h3>
                    <div className="row g-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="col-6 text-center">
                          <img 
                            src={`https://placehold.co/80x80/${['4ade80', '60a5fa', 'f59e0b', 'ef4444', '8b5cf6', '10b981'][index]}/ffffff?text=${member.name.charAt(0)}`} 
                            alt={member.name} 
                            className="rounded-circle mb-2" 
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                          <div className={`fw-bold small ${darkMode ? 'text-light' : ''}`}>{member.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}
        </main>
      </div>

      {selectedOutbreak && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedOutbreak(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className={`modal-content ${darkMode ? 'bg-dark text-light' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">{selectedOutbreak.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOutbreak(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <p><strong>{t('state')}:</strong> {selectedOutbreak.state}</p>
                    <p><strong>{t('cases')}:</strong> {selectedOutbreak.cases.toLocaleString()}</p>
                    <p><strong>{t('rate')}:</strong> {selectedOutbreak.rate}/1000</p>
                    <p><strong>{t('description')}:</strong> {t(`diseases.${selectedOutbreak.name.split(' ')[0].toLowerCase()}`).description}</p>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <h6>{t('statistics')}</h6>
                      <div className="text-center my-3">
                        <div className="display-6 fw-bold text-danger">{selectedOutbreak.cases.toLocaleString()}</div>
                        <div className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('reportedCases')}</div>
                      </div>
                      <div className="progress mb-3" style={{ height: '8px' }}>
                        <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${(selectedOutbreak.rate / 20) * 100}%` }}></div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('rate')}: {selectedOutbreak.rate}/1000</span>
                        <span className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('location2')}: {selectedOutbreak.state}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        aria-label="Open Healify AI chat window"
        className="position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px', backgroundColor: '#0D6EFD', borderRadius: '50%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 50, cursor: 'pointer', transition: 'all 0.3s ease' }}
      >
        <FaComments size={24} color="white" aria-hidden="true" />
      </button>

      {chatOpen && (
        <div className={`position-fixed bottom-0 end-0 m-3 ${darkMode ? 'bg-dark text-light' : 'bg-white'}`} style={{ zIndex: 1000, width: '350px', height: '500px', borderRadius: '1rem', boxShadow: '0 0 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-primary p-3 d-flex justify-content-between align-items-center text-white">
            <div className="d-flex align-items-center">
              <FaRobot className="me-2" />
              <span className="fw-bold">{t('chatTitle')}</span>
            </div>
            <button onClick={toggleChat} className="btn-close btn-close-white"></button>
          </div>
          <div ref={widgetChatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                 {msg.sender === 'ai' && <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />}
                 <div style={{ maxWidth: '75%' }}>
                    <div className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : darkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`}>
                        <p className="mb-0 small">{msg.text}</p>
                    </div>
                    <div className={`text-muted small mt-1 ${msg.sender === 'user' ? 'text-end' : 'text-start'}`}>{msg.timestamp}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start">
                 <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />
                <div className={`p-2 rounded ${darkMode ? 'bg-secondary text-light' : 'bg-light'}`}>
                  <div className="d-flex">
                    <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite' }}></div>
                    <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.15s' }}></div>
                    <div className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`p-3 border-top ${darkMode ? 'border-secondary' : ''}`}>
            <div className="input-group">
              <input
                type="text" value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('chatPlaceholder')}
                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
              />
              <button onClick={handleSendMessage} disabled={!userMessage.trim()} className="btn btn-primary">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
