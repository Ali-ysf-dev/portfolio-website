import { GITHUB_CONFIG } from '../config';

/**
 * Finds PNG image in repository root
 * @param {string} repoName - Repository name
 * @param {string} defaultBranch - Default branch name (usually 'main' or 'master')
 * @returns {Promise<string|null>} URL to PNG image or null if not found
 */
const findRepoCoverImage = async (repoName, defaultBranch = 'main') => {
  try {
    const contentsUrl = `${GITHUB_CONFIG.API_URL}/repos/${GITHUB_CONFIG.USERNAME}/${repoName}/contents`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // If you add a token, uncomment this:
    // if (GITHUB_CONFIG.TOKEN) {
    //   headers['Authorization'] = `token ${GITHUB_CONFIG.TOKEN}`;
    // }

    const response = await fetch(contentsUrl, { headers });
    
    if (!response.ok) {
      return null;
    }

    const contents = await response.json();
    
    // Find PNG files in root directory
    const pngFile = contents.find(file => 
      file.type === 'file' && 
      file.name.toLowerCase().endsWith('.png')
    );
    
    if (pngFile) {
      // Use the download_url from GitHub API (raw content URL)
      return pngFile.download_url;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding cover image for ${repoName}:`, error);
    return null;
  }
};

/**
 * Fetches repositories from GitHub API
 * @param {number} limit - Maximum number of repos to fetch
 * @param {string} sort - Sort by: 'created', 'updated', 'pushed', 'full_name', 'stars'
 * @returns {Promise<Array>} Array of repository objects
 */
export const fetchGitHubRepos = async (limit = 10, sort = 'updated') => {
  try {
    const url = `${GITHUB_CONFIG.API_URL}/users/${GITHUB_CONFIG.USERNAME}/repos?sort=${sort}&per_page=${limit}&type=all`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // If you add a token, uncomment this:
    // if (GITHUB_CONFIG.TOKEN) {
    //   headers['Authorization'] = `token ${GITHUB_CONFIG.TOKEN}`;
    // }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    
    // Filter out forked repositories if needed, or keep them
    // const filteredRepos = repos.filter(repo => !repo.fork);
    
    // Transform GitHub API response and fetch cover images
    const reposWithImages = await Promise.all(
      repos.map(async (repo) => {
        // Try to find PNG cover image in repository root
        const defaultBranch = repo.default_branch || 'main';
        const coverImage = await findRepoCoverImage(repo.name, defaultBranch);
        
        // Use cover image if found, otherwise fallback to OpenGraph image
        const projectImage = coverImage || `https://opengraph.githubassets.com/1/${GITHUB_CONFIG.USERNAME}/${repo.name}`;
        
        return {
          id: repo.id,
          title: repo.name,
          shortDescription: repo.description || 'No description available',
          image: projectImage,
          tags: [
            ...(repo.language ? [repo.language.toLowerCase()] : []),
            ...(repo.topics || []).slice(0, 3)
          ],
          featured: repo.stargazers_count > 0,
          liveUrl: repo.homepage || null, // Live demo URL if available
          codeUrl: repo.html_url, // GitHub repository URL
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at,
          language: repo.language,
          isFork: repo.fork
        };
      })
    );
    
    return reposWithImages;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
};

/**
 * Fetches a single repository by name
 */
export const fetchGitHubRepo = async (repoName) => {
  try {
    const url = `${GITHUB_CONFIG.API_URL}/repos/${GITHUB_CONFIG.USERNAME}/${repoName}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repo = await response.json();
    
    // Try to find PNG cover image in repository root
    const defaultBranch = repo.default_branch || 'main';
    const coverImage = await findRepoCoverImage(repoName, defaultBranch);
    
    // Use cover image if found, otherwise fallback to OpenGraph image
    const projectImage = coverImage || `https://opengraph.githubassets.com/1/${GITHUB_CONFIG.USERNAME}/${repoName}`;
    
    return {
      id: repo.id,
      title: repo.name,
      description: repo.description,
      image: projectImage,
      tags: [
        ...(repo.language ? [repo.language.toLowerCase()] : []),
        ...(repo.topics || [])
      ],
      liveUrl: repo.homepage,
      codeUrl: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language
    };
  } catch (error) {
    console.error('Error fetching GitHub repo:', error);
    return null;
  }
};

