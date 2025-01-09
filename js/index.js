// Selecting the necessary DOM elements
const input = document.getElementById("inp");
const qrcodeContainer = document.getElementById("qrcode-container");
const qrimg = document.getElementById("qrimg");
const btn = document.getElementById("btn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

// Add loading state to button
function setLoading(isLoading) {
  if (isLoading) {
    btn.innerHTML = '<span class="loading"></span> Generating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  } else {
    btn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code';
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// Show success message
function showSuccess() {
  qrcodeContainer.classList.add('success-animation');
  setTimeout(() => {
    qrcodeContainer.classList.remove('success-animation');
  }, 600);
}

// Generate QR Code function
async function generateQRCode() {
  const text = input.value.trim();
  
  if (!text) {
    showNotification('Please enter some text or URL!', 'error');
    input.focus();
    return;
  }

  setLoading(true);
  
  try {
    // Create QR code URL with better parameters
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}&format=png&margin=2&color=000000&bgcolor=FFFFFF`;
    
    // Preload the image
    const img = new Image();
    img.onload = () => {
      qrimg.src = qrUrl;
      qrcodeContainer.style.display = 'block';
      setLoading(false);
      showSuccess();
      showNotification('QR Code generated successfully!', 'success');
    };
    
    img.onerror = () => {
      throw new Error('Failed to generate QR code');
    };
    
    img.src = qrUrl;
    
  } catch (error) {
    setLoading(false);
    showNotification('Failed to generate QR code. Please try again.', 'error');
    console.error('QR Code generation error:', error);
  }
}

// Download QR Code function
function downloadQRCode() {
  const img = qrimg.src;
  if (!img) {
    showNotification('Please generate a QR code first!', 'error');
    return;
  }

  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = img;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('QR Code downloaded successfully!', 'success');
}

// Share QR Code function
async function shareQRCode() {
  const img = qrimg.src;
  if (!img) {
    showNotification('Please generate a QR code first!', 'error');
    return;
  }

  try {
    if (navigator.share) {
      // Convert image to blob for sharing
      const response = await fetch(img);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'QR Code',
        text: 'Check out this QR code I generated!',
        files: [file]
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(input.value);
      showNotification('URL copied to clipboard!', 'success');
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(input.value);
      showNotification('URL copied to clipboard!', 'success');
    } catch (clipboardError) {
      showNotification('Sharing not supported. Please download the QR code.', 'info');
    }
  }
}

// Show notification function
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Event listeners
btn.addEventListener("click", generateQRCode);

downloadBtn.addEventListener("click", downloadQRCode);

shareBtn.addEventListener("click", shareQRCode);

// Enter key support
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    generateQRCode();
  }
});

// Input focus effects
input.addEventListener("focus", () => {
  input.parentElement.style.transform = "scale(1.02)";
});

input.addEventListener("blur", () => {
  input.parentElement.style.transform = "scale(1)";
});

// Auto-generate QR code when input changes (with debounce)
let debounceTimer;
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (input.value.trim() && qrcodeContainer.style.display === 'flex') {
      generateQRCode();
    }
  }, 1000);
});

// Initialize with some helpful text
window.addEventListener('load', () => {
  // Add some example URLs as placeholder suggestions
  const examples = [
    'https://www.google.com',
    'Hello World!',
    'tel:+1234567890',
    'mailto:example@email.com'
  ];
  
  let currentExample = 0;
  setInterval(() => {
    if (!input.matches(':focus')) {
      input.placeholder = `Try: ${examples[currentExample]}`;
      currentExample = (currentExample + 1) % examples.length;
    }
  }, 3000);
});