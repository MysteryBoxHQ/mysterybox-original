// Script to create B2B partner for staging.rollingriches.com
const partner = {
  name: "Rolling Riches",
  slug: "rolling-riches", 
  type: "b2b",
  status: "active",
  domain: "staging.rollingriches.com",
  brandingConfig: {
    primaryColor: "#0079F2",
    secondaryColor: "#FF6B35",
    logoUrl: "",
    companyName: "Rolling Riches"
  },
  integrationConfig: {
    widgetEnabled: true,
    allowedOrigins: ["https://staging.rollingriches.com", "http://localhost:3000"],
    webhookUrl: "",
    rateLimit: 1000
  }
};

console.log("Partner configuration:", JSON.stringify(partner, null, 2));