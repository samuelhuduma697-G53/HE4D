/**
 * Formatters
 * Helper functions for formatting data for display
 */

class Formatters {
  /**
   * Format date
   */
  formatDate(date, format = 'full') {
    const d = new Date(date);
    
    const formats = {
      full: () => d.toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'medium' }),
      date: () => d.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: () => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      relative: () => this.getRelativeTime(d),
      iso: () => d.toISOString(),
      short: () => d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    return formats[format] ? formats[format]() : formats.full();
  }

  /**
   * Get relative time (e.g., "5 minutes ago")
   */
  getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

  /**
   * Format phone number (Kenyan format)
   */
  formatPhone(phone) {
    if (!phone) return null;
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('254')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`;
    }
    
    if (cleaned.startsWith('0')) {
      return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
    }
    
    return phone;
  }

  /**
   * Format currency (KES)
   */
  formatCurrency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage
   */
  formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format acuity score with color
   */
  formatAcuityScore(score) {
    let level = 'low';
    let color = '#22c55e';
    
    if (score >= 8) {
      level = 'critical';
      color = '#dc2626';
    } else if (score >= 6) {
      level = 'high';
      color = '#f97316';
    } else if (score >= 4) {
      level = 'moderate';
      color = '#eab308';
    }
    
    return {
      score: score.toFixed(1),
      level,
      color,
      label: level.toUpperCase()
    };
  }

  /**
   * Format duration in minutes to readable string
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Truncate text
   */
  truncate(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Title case
   */
  titleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Format crisis categories for display
   */
  formatCategory(category) {
    const categories = {
      mental_health: 'Mental Health',
      domestic_violence: 'Domestic Violence',
      legal: 'Legal',
      medical: 'Medical',
      financial: 'Financial',
      housing: 'Housing',
      substance_abuse: 'Substance Abuse',
      suicide_risk: 'Suicide Risk',
      trauma: 'Trauma',
      emergency: 'Emergency',
      other: 'Other'
    };
    
    return categories[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format role for display
   */
  formatRole(role) {
    const roles = {
      seeker: 'Seeker',
      helper: 'Helper',
      super_admin: 'Super Admin',
      senior_admin: 'Senior Admin',
      verification_admin: 'Verification Admin',
      safety_admin: 'Safety Admin',
      content_admin: 'Content Admin'
    };
    
    return roles[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format JSON for pretty display
   */
  formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  /**
   * Format coordinates as DMS (Degrees, Minutes, Seconds)
   */
  formatDMS(lat, lng) {
    const toDMS = (coord, isLat) => {
      const absolute = Math.abs(coord);
      const degrees = Math.floor(absolute);
      const minutesNotTruncated = (absolute - degrees) * 60;
      const minutes = Math.floor(minutesNotTruncated);
      const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
      const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
      return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    };
    
    return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
  }

  /**
   * Format distance in meters or kilometers
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

module.exports = new Formatters();