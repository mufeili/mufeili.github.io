// Add this to your Jekyll assets/js/github-stars.js
function updateGitHubStars() {
    // Find all elements with data-github-repo attribute
    document.querySelectorAll('[data-github-repo]').forEach(elem => {
        const repo = elem.getAttribute('data-github-repo');
        if (!repo) return;

        // Extract owner and repo name from full URL or owner/repo format
        let [owner, repoName] = repo.replace('https://github.com/', '').split('/');
        if (!owner || !repoName) return;

        // Make API request
        fetch(`https://api.github.com/repos/${owner}/${repoName}`)
            .then(response => response.json())
            .then(data => {
                if (data.stargazers_count !== undefined) {
                    elem.textContent = data.stargazers_count;
                }
            })
            .catch(error => console.error('Error fetching GitHub stars:', error));
    });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', updateGitHubStars);