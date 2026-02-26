// Mock API for FaultMatrix Demo
// Real statistics from DynamoDB backup (Feb 19, 2026)

const API_BASE_URL = 'https://api.faultmatrix.example.com';

// Real production statistics from backup
const STATISTICS = {
  total_guides: 1109,
  total_devices: 528,
  total_patterns: 6765,
  total_root_causes: 215
};

// Mock chat responses simulating Claude AI
const MOCK_CHAT_RESPONSES = {
  greeting: "Hello! I'm the FaultMatrix AI assistant. I can help you analyze device failure patterns, search repair guides, and identify root causes. What would you like to know?",
  
  default: "Based on the analysis of {guides} repair guides covering {devices} devices, I've identified {patterns} distinct failure patterns. How can I help you explore this data?",
  
  patterns: "The most common failure patterns include:\n\n1. **Battery Issues** (23%): Swollen batteries, poor battery life, charging problems\n2. **Screen Failures** (18%): Cracked displays, touch responsiveness, LCD damage\n3. **Button Malfunctions** (15%): Stuck power buttons, volume controls\n4. **Connectivity Issues** (12%): Wi-Fi, Bluetooth, cellular problems\n5. **Camera Defects** (10%): Focus issues, lens damage\n\nThese patterns span across {devices} unique device models.",
  
  rootcause: "Root cause analysis using AWS Bedrock identified:\n\n**Common Root Causes:**\n- Manufacturing defects in component quality\n- Design flaws in thermal management\n- Material fatigue from repeated stress\n- Inadequate waterproofing in seals\n- Software-hardware integration issues\n\n**Evidence-Based Insights:**\nAnalysis of {guides} guides shows that {patterns} failure patterns cluster into {causes} distinct root causes, suggesting systematic issues rather than isolated incidents.",
  
  device: "I can search across {devices} devices in our database. Which specific device or manufacturer would you like to analyze? I have data on popular brands including Apple, Samsung, Sony, Canon, HP, and more.",
  
  recommendations: "**Design Recommendations:**\n\n1. **Battery Design**: Implement better thermal management and use higher-quality battery cells\n2. **Screen Durability**: Increase glass thickness and improve edge protection\n3. **Button Longevity**: Use more durable switch mechanisms with higher cycle ratings\n4. **Connectivity**: Improve antenna placement and shielding\n\nThese insights come from analyzing failure patterns across {devices} device models."
};

// Simulate AI chat with contextual responses
const simulateChat = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Determine response type based on keywords
  let responseKey = 'default';
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    responseKey = 'greeting';
  } else if (lowerMessage.includes('pattern') || lowerMessage.includes('common') || lowerMessage.includes('most frequent')) {
    responseKey = 'patterns';
  } else if (lowerMessage.includes('root cause') || lowerMessage.includes('why') || lowerMessage.includes('reason')) {
    responseKey = 'rootcause';
  } else if (lowerMessage.includes('device') || lowerMessage.includes('phone') || lowerMessage.includes('iphone') || lowerMessage.includes('samsung')) {
    responseKey = 'device';
  } else if (lowerMessage.includes('recommend') || lowerMessage.includes('design') || lowerMessage.includes('improve')) {
    responseKey = 'recommendations';
  }
  
  // Get template response
  let response = MOCK_CHAT_RESPONSES[responseKey];
  
  // Replace placeholders with actual statistics
  response = response
    .replace(/{guides}/g, STATISTICS.total_guides)
    .replace(/{devices}/g, STATISTICS.total_devices)
    .replace(/{patterns}/g, STATISTICS.total_patterns)
    .replace(/{causes}/g, STATISTICS.total_root_causes);
  
  return response;
};

// Mock API Service
const mockApi = {
  // Get system statistics
  async getStatistics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: STATISTICS
    };
  },

  // Search devices
  async searchDevices(query = '') {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const devices = [
      { id: '1', name: 'iPhone 12', manufacturer: 'Apple', category: 'Smartphone', failure_count: 45 },
      { id: '2', name: 'Samsung Galaxy S21', manufacturer: 'Samsung', category: 'Smartphone', failure_count: 38 },
      { id: '3', name: 'iPad Air', manufacturer: 'Apple', category: 'Tablet', failure_count: 32 },
      { id: '4', name: 'MacBook Pro 2020', manufacturer: 'Apple', category: 'Laptop', failure_count: 28 },
      { id: '5', name: 'Sony WH-1000XM4', manufacturer: 'Sony', category: 'Headphones', failure_count: 25 },
      { id: '6', name: 'Nintendo Switch', manufacturer: 'Nintendo', category: 'Gaming', failure_count: 22 },
      { id: '7', name: 'Canon EOS 5D', manufacturer: 'Canon', category: 'Camera', failure_count: 20 },
      { id: '8', name: 'Dell XPS 13', manufacturer: 'Dell', category: 'Laptop', failure_count: 18 },
      { id: '9', name: 'HP Photosmart', manufacturer: 'HP', category: 'Printer', failure_count: 15 },
      { id: '10', name: 'Google Pixel 5', manufacturer: 'Google', category: 'Smartphone', failure_count: 12 },
      { id: '11', name: 'Xbox Series X', manufacturer: 'Microsoft', category: 'Gaming', failure_count: 10 },
      { id: '12', name: 'Kindle Paperwhite', manufacturer: 'Amazon', category: 'E-Reader', failure_count: 8 }
    ];
    
    const filtered = query 
      ? devices.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
      : devices;
    
    return {
      success: true,
      data: filtered,
      total: STATISTICS.total_devices
    };
  },

  // Get failure patterns
  async getFailurePatterns(deviceId = null) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const patterns = [
      { pattern: 'Battery Swelling', percentage: 23, severity: 'High', devices_affected: 89 },
      { pattern: 'Screen Cracking', percentage: 18, severity: 'High', devices_affected: 76 },
      { pattern: 'Button Stuck', percentage: 15, severity: 'Medium', devices_affected: 65 },
      { pattern: 'WiFi Connection', percentage: 12, severity: 'Medium', devices_affected: 54 },
      { pattern: 'Camera Focus', percentage: 10, severity: 'Low', devices_affected: 43 },
      { pattern: 'Speaker Distortion', percentage: 8, severity: 'Low', devices_affected: 38 },
      { pattern: 'Charging Port', percentage: 7, severity: 'Medium', devices_affected: 32 },
      { pattern: 'Overheating', percentage: 7, severity: 'High', devices_affected: 29 }
    ];
    
    return {
      success: true,
      data: patterns,
      total: STATISTICS.total_patterns
    };
  },

  // AI Chat - MOCK RESPONSE (No API Key Required)
  async sendChatMessage(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock response based on message content
    const response = simulateChat(message);
    
    return {
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString(),
        // Indicate this is a mock for demo purposes
        note: 'Demo mode - Connect AWS backend for live AI analysis'
      }
    };
  },

  // Get root cause analysis
  async getRootCauseAnalysis(patternId) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      data: {
        pattern: 'Battery Swelling',
        root_cause: 'Thermal Management Failure',
        explanation: 'Analysis of 45 repair guides indicates that inadequate heat dissipation during charging cycles leads to accelerated battery degradation. The battery cells expand due to gas buildup from electrolyte decomposition at elevated temperatures.',
        evidence: [
          'Repair guides mention overheating during charging',
          'Common in devices with metal chassis',
          'Occurs more frequently in warm climates'
        ],
        prevention: 'Implement better thermal design with heat spreaders and temperature monitoring',
        confidence: 0.87
      }
    };
  }
};

export default mockApi;