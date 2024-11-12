function updateGitHubStars() {
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
    
    function getCachedData(key) {
        const cached = localStorage.getItem(key);
        if (cached) {
            const { value, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return value;
            }
        }
        return null;
    }

    function setCachedData(key, value) {
        localStorage.setItem(key, JSON.stringify({
            value,
            timestamp: Date.now()
        }));
    }

    document.querySelectorAll('[data-github-repo]').forEach(async elem => {
        const repo = elem.getAttribute('data-github-repo');
        if (!repo) return;

        // Show loading state
        elem.textContent = '...';

        // Extract owner and repo name
        let [owner, repoName] = repo.replace('https://github.com/', '').split('/');
        if (!owner || !repoName) return;

        const cacheKey = `github-stars-${owner}-${repoName}`;
        const cachedCount = getCachedData(cacheKey);
        
        if (cachedCount !== null) {
            elem.textContent = cachedCount;
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
            
            if (response.status === 403) {
                const resetTime = response.headers.get('X-RateLimit-Reset');
                console.warn('GitHub API rate limit exceeded. Resets at:', new Date(resetTime * 1000));
                return;
            }
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }

            const data = await response.json();
            
            if (data.stargazers_count !== undefined) {
                const stars = data.stargazers_count;
                elem.textContent = stars;
                setCachedData(cacheKey, stars);
            }
        } catch (error) {
            console.error('Error fetching GitHub stars:', error);
            elem.textContent = '⭐';  // Fallback to just showing star icon
        }
    });
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGitHubStars);
} else {
    updateGitHubStars();
}