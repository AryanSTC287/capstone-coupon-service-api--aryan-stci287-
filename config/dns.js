import dns from "dns";

// Force Google DNS to avoid MongoDB Atlas SRV lookup issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);