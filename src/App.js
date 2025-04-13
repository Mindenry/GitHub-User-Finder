import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Search, Moon, Sun, Github, Globe, MapPin, Briefcase, Twitter, Calendar, Star, GitFork, ExternalLink, Activity, Code, Users, Book, Eye, Award, TrendingUp, Clock, Filter, ChevronDown, ChevronUp, Download, Share2, Bookmark, Heart, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';

export default function App() {
  // State management
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference and localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null 
      ? JSON.parse(savedMode) 
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [languageStats, setLanguageStats] = useState([]);
  const [repoActivity, setRepoActivity] = useState([]);
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  const searchInputRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [repoFilter, setRepoFilter] = useState('updated');
  const [starredRepos, setStarredRepos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [commitActivity, setCommitActivity] = useState([]);
  const [compareUser, setCompareUser] = useState('');
  const [comparedUser, setComparedUser] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bookmarkedUsers, setBookmarkedUsers] = useState(() => {
    const saved = localStorage.getItem('bookmarkedUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [expandedRepo, setExpandedRepo] = useState(null);
  const [repoPage, setRepoPage] = useState(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isComparing, setIsComparing] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  const RADAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F'];

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('bg-gray-900');
      document.body.classList.add('text-white');
    } else {
      document.body.classList.remove('bg-gray-900');
      document.body.classList.remove('text-white');
    }
  }, [darkMode]);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Save bookmarked users to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkedUsers', JSON.stringify(bookmarkedUsers));
  }, [bookmarkedUsers]);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus search input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Extract language data from repos
  const getLanguageData = useCallback((repos) => {
    // Extract languages from repos and count occurrences
    const languages = repos
      .map(repo => repo.language)
      .filter(Boolean)
      .reduce((acc, lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {});
    
    // Convert to array for pie chart
    return Object.entries(languages)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Get repo activity data for charts
  const getRepoActivityData = useCallback((repos) => {
    // Sort repos by update date
    const sortedRepos = [...repos].sort((a, b) => 
      new Date(b.updated_at) - new Date(a.updated_at)
    );
    
    // Get activity data for line chart (last 5 updated repos)
    return sortedRepos.slice(0, 5).map(repo => ({
      name: repo.name.length > 10 ? repo.name.substring(0, 10) + '...' : repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      issues: repo.open_issues_count || 0,
      size: repo.size || 0
    })).reverse();
  }, []);

  // Generate mock commit activity data
  const generateCommitActivity = useCallback((repos) => {
    // Use repo update dates to simulate commit activity
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Create data for the last 6 months
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      // Calculate a value based on repos updated in that month
      const reposUpdatedThisMonth = repos.filter(repo => {
        const updateDate = new Date(repo.updated_at);
        return updateDate.getMonth() === monthIndex;
      }).length;
      
      return {
        name: months[monthIndex],
        commits: Math.max(5, reposUpdatedThisMonth * 15 + Math.floor(Math.random() * 30)),
      };
    }).reverse();
  }, []);

  // Add a user to recent searches
  const addToRecentSearches = useCallback((userData) => {
    if (!userData) return;
    
    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.login !== userData.login);
      // Add to beginning and limit to 5
      return [{ 
        login: userData.login, 
        avatar_url: userData.avatar_url,
        name: userData.name || userData.login
      }, ...filtered].slice(0, 5);
    });
  }, []);

  // Add to search history with timestamp
  const addToSearchHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearchHistory(prev => {
      const newEntry = {
        term: searchTerm,
        timestamp: new Date().toISOString()
      };
      return [newEntry, ...prev].slice(0, 20); // Keep last 20 searches
    });
  }, []);

  // Toggle bookmark for a user
  const toggleBookmark = useCallback((userData) => {
    if (!userData) return;
    
    setBookmarkedUsers(prev => {
      const isBookmarked = prev.some(user => user.login === userData.login);
      
      if (isBookmarked) {
        // Remove from bookmarks
        const newBookmarks = prev.filter(user => user.login !== userData.login);
        addNotification(`Removed ${userData.login} from bookmarks`);
        return newBookmarks;
      } else {
        // Add to bookmarks
        const newBookmark = {
          login: userData.login,
          avatar_url: userData.avatar_url,
          name: userData.name || userData.login,
          html_url: userData.html_url,
          bookmarked_at: new Date().toISOString()
        };
        addNotification(`Added ${userData.login} to bookmarks`);
        return [...prev, newBookmark];
      }
    });
  }, []);

  // Check if a user is bookmarked
  const isUserBookmarked = useCallback((login) => {
    return bookmarkedUsers.some(user => user.login === login);
  }, [bookmarkedUsers]);

  // Add a notification
  const addNotification = useCallback((message, type = 'info') => {
    // Create a unique ID by combining timestamp with a random string
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(note => note.id !== id));
    }, 3000);
  }, []);

  // Search for a GitHub user
  const searchUser = async (e) => {
    e?.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setUser(null);
    setRepos([]);
    setStarredRepos([]);
    setFollowers([]);
    setFollowing([]);
    setError('');
    setLoadingProgress(0);
    setRepoPage(1);
    setActiveTab('overview');
    setExpandedRepo(null);

    try {
      // Add to search history
      addToSearchHistory(username);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        throw new Error(userResponse.status === 404 
          ? 'User not found' 
          : 'Error connecting to GitHub API');
      }
      const userData = await userResponse.json();
      setUser(userData);
      addToRecentSearches(userData);

      // Fetch user repositories
      await fetchRepos(username, 1);

      // Generate chart data
      setCommitActivity(generateCommitActivity(repos));

      clearInterval(progressInterval);
      setLoadingProgress(100);
      addNotification(`Successfully loaded profile for ${userData.login}`, 'success');
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay for smoother transition
    }
  };

  // Fetch repositories with pagination
  const fetchRepos = async (user, page = 1, perPage = 10) => {
    try {
      const reposResponse = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=${perPage}&page=${page}&sort=${repoFilter}`
      );
      
      if (!reposResponse.ok) {
        throw new Error('Error fetching repositories');
      }
      
      const reposData = await reposResponse.json();
      
      if (page === 1) {
        setRepos(reposData);
      } else {
        setRepos(prev => [...prev, ...reposData]);
      }
      
      // Check if there are more repos to load
      setHasMoreRepos(reposData.length === perPage);
      
      // Generate chart data
      setLanguageStats(getLanguageData(reposData));
      setRepoActivity(getRepoActivityData(reposData));
      
      return reposData;
    } catch (error) {
      addNotification(`Failed to load repositories: ${error.message}`, 'error');
      return [];
    }
  };

  // Load more repositories
  const loadMoreRepos = async () => {
    if (loading || !hasMoreRepos) return;
    
    setLoading(true);
    const nextPage = repoPage + 1;
    await fetchRepos(username, nextPage);
    setRepoPage(nextPage);
    setLoading(false);
  };

  // Fetch starred repositories
  const fetchStarredRepos = async () => {
    if (!username) return;
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}/starred?per_page=5`);
      if (!response.ok) throw new Error('Failed to fetch starred repositories');
      
      const data = await response.json();
      setStarredRepos(data);
    } catch (error) {
      addNotification(`Failed to load starred repos: ${error.message}`, 'error');
    }
  };

  // Fetch followers
  const fetchFollowers = async () => {
    if (!username) return;
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}/followers?per_page=10`);
      if (!response.ok) throw new Error('Failed to fetch followers');
      
      const data = await response.json();
      setFollowers(data);
    } catch (error) {
      addNotification(`Failed to load followers: ${error.message}`, 'error');
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    if (!username) return;
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}/following?per_page=10`);
      if (!response.ok) throw new Error('Failed to fetch following');
      
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      addNotification(`Failed to load following: ${error.message}`, 'error');
    }
  };

  // Compare with another user
  const compareWithUser = async (e) => {
    e?.preventDefault();
    
    if (!compareUser.trim()) {
      addNotification('Please enter a username to compare with', 'error');
      return;
    }
    
    setIsComparing(true);
    
    try {
      const response = await fetch(`https://api.github.com/users/${compareUser}`);
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? 'Comparison user not found' 
          : 'Error connecting to GitHub API');
      }
      
      const userData = await response.json();
      setComparedUser(userData);
      setShowCompare(true);
      addNotification(`Comparing with ${userData.login}`, 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsComparing(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch additional data based on selected tab
    if (tab === 'starred' && starredRepos.length === 0) {
      fetchStarredRepos();
    } else if (tab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (tab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    addNotification('Search history cleared', 'success');
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    addNotification('Recent searches cleared', 'success');
  };

  // Clear all bookmarks
  const clearBookmarks = () => {
    setBookmarkedUsers([]);
    addNotification('All bookmarks cleared', 'success');
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format number with K, M suffix
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Get comparison data for radar chart
  const getComparisonData = () => {
    if (!user || !comparedUser) return [];
    
    return [
      {
        subject: 'Repos',
        A: user.public_repos,
        B: comparedUser.public_repos,
        fullMark: Math.max(user.public_repos, comparedUser.public_repos) * 1.2
      },
      {
        subject: 'Gists',
        A: user.public_gists || 0,
        B: comparedUser.public_gists || 0,
        fullMark: Math.max(user.public_gists || 0, comparedUser.public_gists || 0) * 1.2
      },
      {
        subject: 'Followers',
        A: user.followers,
        B: comparedUser.followers,
        fullMark: Math.max(user.followers, comparedUser.followers) * 1.2
      },
      {
        subject: 'Following',
        A: user.following,
        B: comparedUser.following,
        fullMark: Math.max(user.following, comparedUser.following) * 1.2
      },
      {
        subject: 'Experience',
        A: new Date().getFullYear() - new Date(user.created_at).getFullYear(),
        B: new Date().getFullYear() - new Date(comparedUser.created_at).getFullYear(),
        fullMark: Math.max(
          new Date().getFullYear() - new Date(user.created_at).getFullYear(),
          new Date().getFullYear() - new Date(comparedUser.created_at).getFullYear()
        ) * 1.2
      }
    ];
  };

  // Component for profile statistics
  const ProfileStat = ({ icon, value, label, color = 'blue' }) => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/60 hover:bg-gray-800' : 'bg-white/90 hover:bg-white'} backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? `bg-${color}-900/50` : `bg-${color}-100`}`}>
          {icon}
        </div>
        <div className="font-bold text-2xl">{formatNumber(value)}</div>
        <div className="text-sm opacity-70">{label}</div>
      </div>
    </div>
  );

  // Component for repository card
  const RepoCard = ({ repo, expanded, onToggleExpand }) => (
    <div 
      className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white/90 hover:bg-white'} backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <a 
            href={repo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-bold text-blue-500 hover:underline flex items-center gap-2"
          >
            <span>{repo.name}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <Star className="w-3 h-3" /> {formatNumber(repo.stargazers_count)}
            </span>
            <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <GitFork className="w-3 h-3" /> {formatNumber(repo.forks_count)}
            </span>
            {repo.open_issues_count > 0 && (
              <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <AlertTriangle className="w-3 h-3" /> {formatNumber(repo.open_issues_count)}
              </span>
            )}
          </div>
        </div>
        
        {repo.description && (
          <p className="mt-1 text-sm opacity-90">{repo.description}</p>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {repo.language && (
            <span className={`px-3 py-1 text-xs rounded-full ${darkMode ? 'bg-blue-900/60' : 'bg-blue-100'} flex items-center gap-1`}>
              <Code className="w-3 h-3" /> {repo.language}
            </span>
          )}
          
          <span className="text-xs opacity-70 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Updated: {formatDate(repo.updated_at)}
          </span>
          
          {repo.license && (
            <span className="text-xs opacity-70 flex items-center gap-1">
              <Book className="w-3 h-3" /> {repo.license.spdx_id}
            </span>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Repository Details</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Eye className="w-3 h-3 opacity-70" />
                    <span>Watchers: {repo.watchers_count}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-3 h-3 opacity-70" />
                    <span>Size: {(repo.size / 1024).toFixed(2)} MB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 opacity-70" />
                    <span>Created: {formatDate(repo.created_at)}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <GitFork className="w-3 h-3 opacity-70" />
                    <span>Default Branch: {repo.default_branch}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Additional Info</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Globe className="w-3 h-3 opacity-70" />
                    <span>Visibility: {repo.private ? 'Private' : 'Public'}</span>
                  </li>
                  {repo.homepage && (
                    <li className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 opacity-70" />
                      <a 
                        href={repo.homepage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        Homepage
                      </a>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Activity className="w-3 h-3 opacity-70" />
                    <span>Issues: {repo.open_issues_count}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 opacity-70" />
                    <span>Archived: {repo.archived ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <a 
                href={`${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`}
                className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Download className="w-3 h-3" /> Download ZIP
              </a>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => onToggleExpand(repo.id)}
          className={`mt-3 text-xs flex items-center justify-center gap-1 py-1 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Show More
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Component for user card (followers/following)
  const UserCard = ({ user }) => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/60' : 'bg-white/90'} backdrop-blur-sm shadow-lg flex items-center gap-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <img 
        src={user.avatar_url} 
        alt={`${user.login}'s avatar`}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <a 
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-500 hover:underline flex items-center gap-1"
        >
          {user.login}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <button
        onClick={() => {
          setUsername(user.login);
          searchUser();
        }}
        className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );

  // Component for notification toast
  const NotificationToast = ({ notification, onClose }) => {
    const bgColor = notification.type === 'error' 
      ? (darkMode ? 'bg-red-900/80' : 'bg-red-100') 
      : notification.type === 'success'
        ? (darkMode ? 'bg-green-900/80' : 'bg-green-100')
        : (darkMode ? 'bg-blue-900/80' : 'bg-blue-100');
    
    const textColor = notification.type === 'error'
      ? (darkMode ? 'text-red-200' : 'text-red-800')
      : notification.type === 'success'
        ? (darkMode ? 'text-green-200' : 'text-green-800')
        : (darkMode ? 'text-blue-200' : 'text-blue-800');
    
    const Icon = notification.type === 'error'
      ? X
      : notification.type === 'success'
        ? Check
        : AlertTriangle;
    
    return (
      <div className={`${bgColor} ${textColor} p-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm`}>
        <Icon className="w-5 h-5" />
        <span>{notification.message}</span>
        <button 
                    onClick={() => onClose(notification.id)}
                    className="ml-auto text-opacity-70 hover:text-opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            };
          
            // Component for tab button
            const TabButton = ({ active, onClick, children }) => (
              <button
                onClick={onClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  active 
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                }`}
              >
                {children}
              </button>
            );
          
            return (
              <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-800'}`}>
                {/* Notification System */}
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
    {notifications.map(notification => (
      <NotificationToast 
        key={notification.id} 
        notification={notification} 
        onClose={(id) => setNotifications(prev => prev.filter(note => note.id !== id))}
      />
    ))}
  </div>
          
                {/* Hero Header */}
                <div className={`relative overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white`}>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                    {/* Additional decorative elements */}
                    <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-purple-500 rounded-full opacity-10 blur-2xl"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-400 rounded-full opacity-10 blur-2xl"></div>
                  </div>
                  
                  <nav className="container mx-auto p-6 relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Github className="w-8 h-8" />
                      <h1 className="text-2xl font-bold">GitHub Explorer</h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500/80 hover:bg-blue-500'} transition-colors duration-300 relative`}
                        aria-label="Bookmarks"
                      >
                        <Bookmark className="w-5 h-5" />
                        {bookmarkedUsers.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                            {bookmarkedUsers.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowSearchHistory(!showSearchHistory)}
                        className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500/80 hover:bg-blue-500'} transition-colors duration-300`}
                        aria-label="Search History"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500/80 hover:bg-blue-500'} transition-colors duration-300`}
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </button>
                    </div>
                  </nav>
                  
                  <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-10">
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore GitHub Developers</h2>
                      <p className="text-lg opacity-90">Discover profiles, repositories, and contributions from developers around the world</p>
                    </div>
                    
                    <div className={`relative max-w-2xl mx-auto transition-all duration-300 ${isSearchBarFocused ? 'transform scale-105' : ''}`}>
                      <form onSubmit={searchUser} className="flex items-center">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search GitHub username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => {
                              setIsSearchBarFocused(true);
                              setShowRecentSearches(true);
                            }}
                            onBlur={() => {
                              setIsSearchBarFocused(false);
                              // Delay hiding to allow clicking on recent searches
                              setTimeout(() => setShowRecentSearches(false), 200);
                            }}
                            className={`w-full p-4 pl-12 pr-4 rounded-l-lg ${darkMode ? 'bg-gray-700/90 text-white' : 'bg-white text-gray-900'} backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-0`}
                          />
                          {username && (
                            <button
                              type="button"
                              onClick={() => setUsername('')}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              <span className="text-xl">&times;</span>
                            </button>
                          )}
                          
                          {/* Recent searches dropdown */}
                          {showRecentSearches && recentSearches.length > 0 && (
                            <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-10 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                              <div className="p-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm font-medium">Recent Searches</span>
                                <button 
                                  onClick={clearRecentSearches}
                                  className="text-xs text-red-500 hover:text-red-700"
                                >
                                  Clear All
                                </button>
                              </div>
                              <ul>
                                {recentSearches.map((item, index) => (
                                  <li key={index}>
                                    <button
                                      onClick={() => {
                                        setUsername(item.login);
                                        searchUser();
                                      }}
                                      className={`w-full p-2 flex items-center gap-3 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                                    >
                                      <img 
                                        src={item.avatar_url} 
                                        alt={`${item.login}'s avatar`}
                                        className="w-8 h-8 rounded-full"
                                      />
                                      <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm opacity-70">@{item.login}</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <button 
                          type="submit" 
                          className={`px-6 py-4 rounded-r-lg font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300 shadow-lg`}
                          disabled={loading}
                        >
                          {loading ? 'Searching...' : 'Search'}
                        </button>
                      </form>
                      
                      {/* Compare users form */}
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setShowCompare(!showCompare)}
                          className={`text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          <Users className="w-4 h-4" />
                          {showCompare ? 'Hide comparison' : 'Compare with another user'}
                        </button>
                      </div>
                      
                      {showCompare && (
                        <form onSubmit={compareWithUser} className="mt-3 flex items-center">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Enter username to compare..."
                              value={compareUser}
                              onChange={(e) => setCompareUser(e.target.value)}
                              className={`w-full p-3 pl-4 pr-4 rounded-l-lg ${darkMode ? 'bg-gray-700/90 text-white' : 'bg-white text-gray-900'} backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border-0 text-sm`}
                            />
                          </div>
                          <button 
                            type="submit" 
                            className={`px-4 py-3 rounded-r-lg font-medium ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white transition-colors duration-300 shadow-lg text-sm`}
                            disabled={isComparing}
                          >
                            {isComparing ? 'Comparing...' : 'Compare'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
          
                {/* Bookmarks Sidebar */}
                {showBookmarks && (
                  <div className={`fixed top-0 right-0 h-full w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-50 transform transition-transform duration-300 overflow-auto`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Bookmark className="w-5 h-5" /> Bookmarked Users
                      </h3>
                      <button 
                        onClick={() => setShowBookmarks(false)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {bookmarkedUsers.length === 0 ? (
                      <div className="p-6 text-center opacity-70">
                        <p>No bookmarked users yet</p>
                        <p className="text-sm mt-2">Search for users and bookmark them to see them here</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-2 flex justify-end">
                          <button 
                            onClick={clearBookmarks}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Clear All
                          </button>
                        </div>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {bookmarkedUsers.map((user, index) => (
                            <li key={index} className="p-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={user.avatar_url} 
                                  alt={`${user.login}'s avatar`}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm opacity-70">@{user.login}</div>
                                </div>
                                <button
                                  onClick={() => {
                                    setUsername(user.login);
                                    searchUser();
                                    setShowBookmarks(false);
                                  }}
                                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2 text-xs opacity-70">
                                Bookmarked on {formatDate(user.bookmarked_at)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
          
                {/* Search History Sidebar */}
                {showSearchHistory && (
                  <div className={`fixed top-0 right-0 h-full w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-50 transform transition-transform duration-300 overflow-auto`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Search History
                      </h3>
                      <button 
                        onClick={() => setShowSearchHistory(false)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {searchHistory.length === 0 ? (
                      <div className="p-6 text-center opacity-70">
                        <p>No search history yet</p>
                        <p className="text-sm mt-2">Your search queries will appear here</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-2 flex justify-end">
                          <button 
                            onClick={clearSearchHistory}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Clear History
                          </button>
                        </div>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {searchHistory.map((item, index) => (
                            <li key={index} className="p-3">
                              <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 opacity-70" />
                                <div className="flex-1">
                                  <div className="font-medium">{item.term}</div>
                                  <div className="text-xs opacity-70">
                                    {formatDate(item.timestamp)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setUsername(item.term);
                                    searchUser();
                                    setShowSearchHistory(false);
                                  }}
                                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
          
                <main className="container mx-auto px-4 py-8">
                  {error && (
                    <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800/50 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
          
                  {loading && (
                    <div className="flex flex-col items-center justify-center my-16">
                      <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-center opacity-70">Fetching data from GitHub...</p>
                    </div>
                  )}
          
                  {user && !loading && (
                    <>
                      {/* User Profile Header */}
                      <div className={`relative rounded-2xl overflow-hidden mb-8 ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`h-32 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}></div>
                        <div className="px-8 pb-8 pt-0 relative">
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative -mt-16">
                              <div className={`absolute inset-0 -m-2 rounded-full ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'} blur-md opacity-60`}></div>
                              <img 
                                src={user.avatar_url} 
                                alt={`${user.login}'s avatar`} 
                                className="w-32 h-32 rounded-full object-cover relative border-4 border-white dark:border-gray-800"
                              />
                            </div>
                            
                            <div className="flex-1 pt-4 md:pt-0">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <h2 className="text-3xl font-bold">{user.name || user.login}</h2>
                                  <p className={`text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>@{user.login}</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleBookmark(user)}
                                    className={`p-2 rounded-lg flex items-center gap-2 ${
                                      isUserBookmarked(user.login)
                                        ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800')
                                        : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
                                    }`}
                                  >
                                    {isUserBookmarked(user.login) ? (
                                      <>
                                        <Bookmark className="w-5 h-5 fill-current" />
                                        <span className="text-sm font-medium">Bookmarked</span>
                                      </>
                                    ) : (
                                      <>
                                        <Bookmark className="w-5 h-5" />
                                        <span className="text-sm font-medium">Bookmark</span>
                                      </>
                                    )}
                                  </button>
                                  
                                  <a 
                                    href={user.html_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                  >
                                    <Github className="w-5 h-5" />
                                    <span className="text-sm font-medium">View on GitHub</span>
                                  </a>
                                </div>
                              </div>
                              
                              {user.bio && (
                                <div className="mt-4 italic opacity-90">
                                  "{user.bio}"
                                </div>
                              )}
                              
                              <div className="mt-4 flex flex-wrap gap-4">
                                {user.company && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="w-4 h-4 opacity-70" />
                                    <span>{user.company}</span>
                                  </div>
                                )}
                                {user.location && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 opacity-70" />
                                    <span>{user.location}</span>
                                  </div>
                                )}
                                {user.blog && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Globe className="w-4 h-4 opacity-70" />
                                    <a 
                                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline truncate"
                                    >
                                      {user.blog}
                                    </a>
                                  </div>
                                )}
                                {user.twitter_username && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Twitter className="w-4 h-4 opacity-70" />
                                    <a 
                                      href={`https://twitter.com/${user.twitter_username}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      @{user.twitter_username}
                                    </a>
                                  </div>
                                )}
                                {user.created_at && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 opacity-70" />
                                    <span>Joined {formatDate(user.created_at)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                            <ProfileStat 
                              icon={<Users className="w-5 h-5 text-blue-500" />} 
                              value={user.followers} 
                              label="Followers" 
                              color="blue"
                            />
                            <ProfileStat 
                              icon={<Users className="w-5 h-5 text-green-500" />} 
                              value={user.following} 
                              label="Following" 
                              color="green"
                            />
                            <ProfileStat 
                              icon={<Code className="w-5 h-5 text-purple-500" />} 
                              value={user.public_repos} 
                              label="Repositories" 
                              color="purple"
                            />
                            <ProfileStat 
                              icon={<Activity className="w-5 h-5 text-yellow-500" />} 
                              value={user.public_gists || 0} 
                              label="Gists" 
                              color="yellow"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Comparison Section */}
                      {comparedUser && (
                        <div className={`mb-8 p-6 rounded-2xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">User Comparison</h3>
                            <button
                              onClick={() => {
                                setComparedUser(null);
                                setShowCompare(false);
                              }}
                              className={`p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                              Close Comparison
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                              <div className="flex items-center gap-4 mb-4">
                                <img 
                                  src={user.avatar_url} 
                                  alt={`${user.login}'s avatar`}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div>
                                  <div className="font-medium">{user.name || user.login}</div>
                                  <div className="text-sm opacity-70">@{user.login}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 mb-4">
                                <img 
                                  src={comparedUser.avatar_url} 
                                  alt={`${comparedUser.login}'s avatar`}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div>
                                  <div className="font-medium">{comparedUser.name || comparedUser.login}</div>
                                  <div className="text-sm opacity-70">@{comparedUser.login}</div>
                                </div>
                              </div>
                              
                              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} mt-4`}>
                                <h4 className="font-medium mb-2">Comparison Summary</h4>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex justify-between">
                                    <span>Repositories:</span>
                                    <span className="font-medium">
                                      {user.public_repos} vs {comparedUser.public_repos}
                                    </span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Followers:</span>
                                    <span className="font-medium">
                                      {user.followers} vs {comparedUser.followers}
                                    </span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Following:</span>
                                    <span className="font-medium">
                                      {user.following} vs {comparedUser.following}
                                    </span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Gists:</span>
                                    <span className="font-medium">
                                      {user.public_gists || 0} vs {comparedUser.public_gists || 0}
                                    </span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Account Age:</span>
                                    <span className="font-medium">
                                      {new Date().getFullYear() - new Date(user.created_at).getFullYear()} yrs vs {new Date().getFullYear() - new Date(comparedUser.created_at).getFullYear()} yrs
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="lg:col-span-2">
                              <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart outerRadius={90} data={getComparisonData()}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                    <Radar name={user.login} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Radar name={comparedUser.login} dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    <Legend />
                                    <Tooltip />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                              
                              <div className="mt-4 text-center text-sm opacity-70">
                                Radar chart comparing key metrics between users
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Tabs Navigation */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <TabButton 
                          active={activeTab === 'overview'} 
                          onClick={() => handleTabChange('overview')}
                        >
                          Overview
                        </TabButton>
                        <TabButton 
                          active={activeTab === 'repositories'} 
                          onClick={() => handleTabChange('repositories')}
                        >
                          Repositories
                        </TabButton>
                        <TabButton 
                          active={activeTab === 'starred'} 
                          onClick={() => handleTabChange('starred')}
                        >
                          Starred
                        </TabButton>
                        <TabButton 
                                          active={activeTab === 'followers'} 
                                          onClick={() => handleTabChange('followers')}
                                        >
                                          Followers
                                        </TabButton>
                                        <TabButton 
                                          active={activeTab === 'following'} 
                                          onClick={() => handleTabChange('following')}
                                        >
                                          Following
                                        </TabButton>
                                        <TabButton 
                                          active={activeTab === 'activity'} 
                                          onClick={() => handleTabChange('activity')}
                                        >
                                          Activity
                                        </TabButton>
                                      </div>
                                      
                                      {/* Tab Content */}
                                      <div className="mb-8">
                                        {/* Overview Tab */}
                                        {activeTab === 'overview' && (
                                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* User Stats */}
                                            <div className={`lg:col-span-1 p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                              <h3 className="text-xl font-bold mb-4">Profile Summary</h3>
                                              
                                              <div className="space-y-4">
                                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                                                  <h4 className="font-medium mb-2">GitHub Stats</h4>
                                                  <ul className="space-y-2">
                                                    <li className="flex justify-between">
                                                      <span>Repositories:</span>
                                                      <span className="font-medium">{user.public_repos}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>Gists:</span>
                                                      <span className="font-medium">{user.public_gists || 0}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>Followers:</span>
                                                      <span className="font-medium">{user.followers}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>Following:</span>
                                                      <span className="font-medium">{user.following}</span>
                                                    </li>
                                                  </ul>
                                                </div>
                                                
                                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                                                  <h4 className="font-medium mb-2">Account Info</h4>
                                                  <ul className="space-y-2">
                                                    <li className="flex justify-between">
                                                      <span>Type:</span>
                                                      <span className="font-medium capitalize">{user.type}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>Created:</span>
                                                      <span className="font-medium">{formatDate(user.created_at)}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>Updated:</span>
                                                      <span className="font-medium">{formatDate(user.updated_at)}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                      <span>ID:</span>
                                                      <span className="font-medium">{user.id}</span>
                                                    </li>
                                                  </ul>
                                                </div>
                                                
                                                {user.hireable && (
                                                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'} flex items-center gap-2`}>
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span>Available for hire</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Charts and Visualizations */}
                                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                              {/* Language Distribution */}
                                              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <h3 className="text-lg font-bold mb-4">Language Distribution</h3>
                                                <div className="h-64">
                                                  {languageStats.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                      <PieChart>
                                                        <Pie
                                                          data={languageStats}
                                                          cx="50%"
                                                          cy="50%"
                                                          outerRadius={80}
                                                          fill="#8884d8"
                                                          dataKey="value"
                                                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                          labelLine={false}
                                                        >
                                                          {languageStats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                          ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value, name) => [`${value} repos`, name]} />
                                                      </PieChart>
                                                    </ResponsiveContainer>
                                                  ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                      <p className="text-center opacity-70">No language data available</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Repository Activity */}
                                              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <h3 className="text-lg font-bold mb-4">Repository Activity</h3>
                                                <div className="h-64">
                                                  {repoActivity.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                      <BarChart data={repoActivity}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="stars" fill="#8884d8" name="Stars" />
                                                        <Bar dataKey="forks" fill="#82ca9d" name="Forks" />
                                                      </BarChart>
                                                    </ResponsiveContainer>
                                                  ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                      <p className="text-center opacity-70">No activity data available</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Commit Activity */}
                                              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} md:col-span-2`}>
                                                <h3 className="text-lg font-bold mb-4">Commit Activity</h3>
                                                <div className="h-64">
                                                  {commitActivity.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                      <LineChart data={commitActivity}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Line type="monotone" dataKey="commits" stroke="#8884d8" strokeWidth={2} />
                                                      </LineChart>
                                                    </ResponsiveContainer>
                                                  ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                      <p className="text-center opacity-70">No commit data available</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Repositories Tab */}
                                        {activeTab === 'repositories' && (
                                          <div className="space-y-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm opacity-70">Sort by:</span>
                                                <select
                                                  value={repoFilter}
                                                  onChange={(e) => setRepoFilter(e.target.value)}
                                                  className={`p-2 rounded-md text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                                                >
                                                  <option value="updated">Last Updated</option>
                                                  <option value="created">Created Date</option>
                                                  <option value="pushed">Last Pushed</option>
                                                  <option value="full_name">Name</option>
                                                </select>
                                              </div>
                                              
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => setViewMode('grid')}
                                                  className={`p-2 rounded-md ${viewMode === 'grid' ? (darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
                                                >
                                                  <div className="grid grid-cols-2 gap-1 w-5 h-5">
                                                    <div className={`${viewMode === 'grid' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                    <div className={`${viewMode === 'grid' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                    <div className={`${viewMode === 'grid' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                    <div className={`${viewMode === 'grid' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                  </div>
                                                </button>
                                                <button
                                                  onClick={() => setViewMode('list')}
                                                  className={`p-2 rounded-md ${viewMode === 'list' ? (darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
                                                >
                                                  <div className="flex flex-col gap-1 w-5 h-5 justify-center">
                                                    <div className={`h-1 ${viewMode === 'list' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                    <div className={`h-1 ${viewMode === 'list' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                    <div className={`h-1 ${viewMode === 'list' ? 'bg-white' : darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-sm`}></div>
                                                  </div>
                                                </button>
                                              </div>
                                            </div>
                                            
                                            {repos.length === 0 ? (
                                              <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} text-center`}>
                                                <p className="opacity-70">No repositories found</p>
                                              </div>
                                            ) : (
                                              <>
                                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                                                  {repos.map(repo => (
                                                    <RepoCard 
                                                      key={repo.id} 
                                                      repo={repo} 
                                                      expanded={expandedRepo === repo.id}
                                                      onToggleExpand={(id) => setExpandedRepo(expandedRepo === id ? null : id)}
                                                    />
                                                  ))}
                                                </div>
                                                
                                                {hasMoreRepos && (
                                                  <div className="flex justify-center mt-8">
                                                    <button
                                                      onClick={loadMoreRepos}
                                                      className={`px-6 py-3 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2 transition-colors duration-300`}
                                                      disabled={loading}
                                                    >
                                                      {loading ? (
                                                        <>
                                                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                          <span>Loading...</span>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <span>Load More</span>
                                                          <ChevronDown className="w-4 h-4" />
                                                        </>
                                                      )}
                                                    </button>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Starred Tab */}
                                        {activeTab === 'starred' && (
                                          <div className="space-y-6">
                                            {starredRepos.length === 0 ? (
                                              <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} text-center`}>
                                                <p className="opacity-70">No starred repositories found</p>
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-1 gap-6">
                                                {starredRepos.map(repo => (
                                                  <RepoCard 
                                                    key={repo.id} 
                                                    repo={repo} 
                                                    expanded={expandedRepo === repo.id}
                                                    onToggleExpand={(id) => setExpandedRepo(expandedRepo === id ? null : id)}
                                                  />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Followers Tab */}
                                        {activeTab === 'followers' && (
                                          <div className="space-y-6">
                                            {followers.length === 0 ? (
                                              <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} text-center`}>
                                                <p className="opacity-70">No followers found</p>
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {followers.map(follower => (
                                                  <UserCard key={follower.id} user={follower} />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Following Tab */}
                                        {activeTab === 'following' && (
                                          <div className="space-y-6">
                                            {following.length === 0 ? (
                                              <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} text-center`}>
                                                <p className="opacity-70">Not following anyone</p>
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {following.map(followedUser => (
                                                  <UserCard key={followedUser.id} user={followedUser} />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Activity Tab */}
                                        {activeTab === 'activity' && (
                                          <div className="space-y-6">
                                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/80'} backdrop-blur-md shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                                              
                                              <div className="relative">
                                                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                                                
                                                <div className="space-y-6">
                                                  {repos.slice(0, 5).map((repo, index) => (
                                                    <div key={repo.id} className="relative pl-12">
                                                      <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                        {index === 0 ? (
                                                          <Star className="w-6 h-6 text-yellow-500" />
                                                        ) : index === 1 ? (
                                                          <GitFork className="w-6 h-6 text-blue-500" />
                                                        ) : index === 2 ? (
                                                          <Code className="w-6 h-6 text-purple-500" />
                                                        ) : index === 3 ? (
                                                          <Eye className="w-6 h-6 text-green-500" />
                                                        ) : (
                                                          <Activity className="w-6 h-6 text-red-500" />
                                                        )}
                                                      </div>
                                                      
                                                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                                                        <div className="flex justify-between items-start">
                                                          <div>
                                                            <h4 className="font-medium">
                                                              {index === 0 
                                                                ? 'Created repository' 
                                                                : index === 1 
                                                                  ? 'Forked repository' 
                                                                  : index === 2 
                                                                    ? 'Pushed commits' 
                                                                    : index === 3 
                                                                      ? 'Watched repository' 
                                                                      : 'Updated repository'}
                                                            </h4>
                                                            <a 
                                                              href={repo.html_url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-blue-500 hover:underline"
                                                            >
                                                              {repo.full_name}
                                                            </a>
                                                          </div>
                                                          <span className="text-xs opacity-70">{formatDate(repo.updated_at)}</span>
                                                        </div>
                                                        
                                                        {repo.description && (
                                                          <p className="mt-2 text-sm opacity-90">{repo.description}</p>
                                                        )}
                                                        
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                          {repo.language && (
                                                            <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-blue-900/60' : 'bg-blue-100'} flex items-center gap-1`}>
                                                              <Code className="w-3 h-3" /> {repo.language}
                                                            </span>
                                                          )}
                                                          
                                                          <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center gap-1`}>
                                                            <Star className="w-3 h-3" /> {repo.stargazers_count}
                                                          </span>
                                                          
                                                          <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center gap-1`}>
                                                            <GitFork className="w-3 h-3" /> {repo.forks_count}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </main>
                          
                                {showScrollTop && (
                                  <button
                                    onClick={scrollToTop}
                                    className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-all duration-300 z-40 transform hover:scale-110`}
                                    aria-label="Scroll to top"
                                  >
                                    <ChevronUp className="w-6 h-6" />
                                  </button>
                                )}
                          
                                <footer className={`p-8 text-center ${darkMode ? 'bg-gray-800/90' : 'bg-gray-100/90'} backdrop-blur-sm`}>
                                  <div className="container mx-auto">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Github className="w-5 h-5" />
                                        <p className="font-medium">GitHub Explorer &copy; {new Date().getFullYear()}</p>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">About</a>
                                        <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Privacy Policy</a>
                                        <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Contact</a>
                                      </div>
                                    </div>
                                    <div className="mt-4 text-sm opacity-70">
                                    Powered by GitHub API 
                                    </div>
                                  </div>
                                </footer>
                              </div>
                            );
                          }