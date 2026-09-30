/**
 * Utility function to extract the Store Slug (Tenant ID) from the URL.
 * It first checks for a wildcard subdomain (e.g., storename.yourdomain.com).
 * If not found, it falls back to the ?store= parameter.
 */
export const getTenantId = () => {
    // 1. Subdomain Check (Wildcard Subdomains)
    const hostname = window.location.hostname;
    
    // Check if it's not a generic localhost or IP address without a subdomain
    if (hostname !== 'localhost' && !hostname.match(/^[0-9.]+$/)) {
        const parts = hostname.split('.');
        
        // If it has at least 2 parts and it's running locally (e.g. sneakers.localhost)
        // Or if it has 3 parts in production (e.g. sneakers.myecom.com)
        if (parts.length >= 2 && parts[0] !== 'www') {
            return parts[0];
        }
    }

    // 2. URL Parameter Fallback (Legacy / Testing)
    // url-il ninnum store parameter edukkunnu (eg: ?store=sneakers)
    const urlParams = new URLSearchParams(window.location.search);
    const storeParam = urlParams.get('store');
    
    return storeParam || null;
};
