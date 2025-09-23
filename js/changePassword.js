$(document).ready(function() {
    var currentPage = 1;
    var usersPerPage = 10;
    var allUsers = [];
    var filteredUsers = [];
    var selectedUser = null;
    
    // Load users from API
    function loadUsers() {
        var statusDiv = document.getElementById("usersTableBody");
        statusDiv.innerHTML = "<tr><td colspan=\"5\" class=\"text-center\"><div class=\"pkp_spinner\"></div> Loading users...</td></tr>";
        
        // Get the base URL and context path dynamically
        var baseUrl = window.location.protocol + "//" + window.location.host;
        var pathParts = window.location.pathname.split("/");
        var contextPath = "";
        
        // Find the context path (usually after index.php)
        for (var i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === "index.php" && i + 1 < pathParts.length) {
                contextPath = pathParts[i + 1];
                break;
            }
        }
        
        // Construct the API URL
        var apiUrl = contextPath ? 
            baseUrl + "/index.php/" + contextPath + "/api/v1/users?searchPhrase&status=all&includePermissions=true&offset=0&count=100&page=1&perPage=100" :
            baseUrl + "/api/v1/users?searchPhrase&status=all&includePermissions=true&offset=0&count=100&page=1&perPage=100";
        
        var apiUrls = [apiUrl];
        
        function tryNextUrl(urlIndex) {
            if (urlIndex >= apiUrls.length) {
                // All URLs failed, show mock data
                showMockUsers();
                return;
            }
            
            $.ajax({
                url: apiUrls[urlIndex],
                method: "GET",
                success: function(data) {
                    console.log("Successfully loaded users from:", apiUrls[urlIndex]);
                    if (data.items && Array.isArray(data.items)) {
                        allUsers = data.items;
                        filteredUsers = allUsers;
                        displayUsers();
                        updatePagination();
                        $("#changePasswordResult").html("<div class=\"alert alert-success\">Loaded " + data.items.length + " users from OJS API (Total: " + data.itemsMax + ")</div>");
                    } else {
                        tryNextUrl(urlIndex + 1);
                    }
                },
                error: function(xhr, status, error) {
                    console.log("Failed to load from:", apiUrls[urlIndex], "Error:", error);
                    tryNextUrl(urlIndex + 1);
                }
            });
        }
        
        tryNextUrl(0);
    }
    
    // Show mock users when API is not available
    function showMockUsers() {
        allUsers = [
            {
                id: 1,
                userName: "admin",
                email: "admin@example.com",
                fullName: "Administrator User",
                groups: [{name: "Site Administrator"}]
            },
            {
                id: 2,
                userName: "editor",
                email: "editor@example.com",
                fullName: "Journal Editor",
                groups: [{name: "Journal Manager"}]
            },
            {
                id: 3,
                userName: "author1",
                email: "author1@example.com",
                fullName: "John Author",
                groups: [{name: "Author"}]
            },
            {
                id: 4,
                userName: "reviewer1",
                email: "reviewer1@example.com",
                fullName: "Jane Reviewer",
                groups: [{name: "Reviewer"}]
            }
        ];
        filteredUsers = allUsers;
        displayUsers();
        updatePagination();
        $("#changePasswordResult").html("<div class=\"alert alert-info\">Using mock data - OJS API requires authentication</div>");
    }
    
    // Display users for current page
    function displayUsers() {
        var startIndex = (currentPage - 1) * usersPerPage;
        var endIndex = startIndex + usersPerPage;
        var usersToShow = filteredUsers.slice(startIndex, endIndex);
        
        var html = "";
        if (usersToShow.length === 0) {
            html = "<tr><td colspan=\"5\" class=\"text-center\">No users found</td></tr>";
        } else {
            $.each(usersToShow, function(index, user) {
                // Handle different user data formats from OJS API
                var userId = user.id || user.userId || user._id;
                var username = user.userName || user.username || user.name;
                var email = user.email || user.emailAddress;
                var fullName = user.fullName || 
                              (user.givenName && user.familyName ? 
                               (user.givenName.en || user.givenName) + " " + (user.familyName.en || user.familyName) :
                               user.firstName + " " + user.lastName) ||
                              username;
                
                // Handle user groups/roles
                var roles = "";
                if (user.groups && Array.isArray(user.groups)) {
                    roles = user.groups.map(function(group) {
                        return group.name || group.abbrev || group;
                    }).join(", ");
                } else if (user.roles && Array.isArray(user.roles)) {
                    roles = user.roles.join(", ");
                }
                
                html += "<tr class=\"border border-separate border-light even:bg-tertiary\">";
                html += "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + (username || "N/A") + "</span></td>";
                html += "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + (email || "N/A") + "</span></td>";
                html += "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + (fullName || "N/A") + "</span></td>";
                html += "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + (roles || "N/A") + "</span></td>";
                html += "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"><button class=\"pkpButton inline-flex relative items-center gap-x-1  text-lg-semibold text-primary border-light  hover:text-hover disabled:text-disabled  bg-secondary py-[0.4375rem] px-3 border rounded change-password-btn\" data-user-id=\"" + userId + "\" data-user-name=\"" + (username || "") + "\">Change Password</button></td>";
                html += "</tr>";
            });
        }
        
        $("#usersTableBody").html(html);
    }
    
    // Update pagination controls
    function updatePagination() {
        var totalUsers = filteredUsers.length;
        var totalPages = Math.ceil(totalUsers / usersPerPage);
        var startIndex = (currentPage - 1) * usersPerPage + 1;
        var endIndex = Math.min(currentPage * usersPerPage, totalUsers);
        
        // Update info
        $("#paginationInfo").text("Showing " + startIndex + " - " + endIndex + " of " + totalUsers + " users");
        
        // Update buttons
        $("#prevPage").prop("disabled", currentPage <= 1);
        $("#nextPage").prop("disabled", currentPage >= totalPages);
        
        // Update page numbers
        var pageNumbersHtml = "";
        for (var i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            if (i === currentPage) {
                pageNumbersHtml += "<strong>" + i + "</strong> ";
            } else {
                pageNumbersHtml += "<a href=\"#\" class=\"page-link\" data-page=\"" + i + "\">" + i + "</a> ";
            }
        }
        $("#pageNumbers").html(pageNumbersHtml);
    }
    
    // Search functionality
    $("#userSearch").on("input", function() {
        var searchTerm = $(this).val().toLowerCase();
        if (searchTerm === "") {
            filteredUsers = allUsers;
        } else {
            filteredUsers = allUsers.filter(function(user) {
                return (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) ||
                       (user.userName && user.userName.toLowerCase().includes(searchTerm)) ||
                       (user.email && user.email.toLowerCase().includes(searchTerm));
            });
        }
        currentPage = 1;
        displayUsers();
        updatePagination();
    });
    
    // Pagination event handlers
    $("#prevPage").on("click", function() {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
            updatePagination();
        }
    });
    
    $("#nextPage").on("click", function() {
        var totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
            updatePagination();
        }
    });
    
    // Page number clicks
    $(document).on("click", ".page-link", function(e) {
        e.preventDefault();
        currentPage = parseInt($(this).data("page"));
        displayUsers();
        updatePagination();
    });
    
    // Change password button clicks
    $(document).on("click", ".change-password-btn", function() {
        var userId = $(this).data("user-id");
        var userName = $(this).data("user-name");
        
        $("#selectedUserId").val(userId);
        $("#selectedUserName").text(userName);
        $("#newPassword").val("");
        $("#changePasswordResult").html("");
        $("#passwordModal").show();
    });
    
    // Modal cancel button
    $("#cancelModal").on("click", function() {
        $("#passwordModal").hide();
    });
    
    // Close modal when clicking outside
    $("#passwordModal").on("click", function(e) {
        if (e.target === this) {
            $(this).hide();
        }
    });
    
    // Handle password change form submission
    $("#changePasswordForm").on("submit", function(e) {
        e.preventDefault();
        var userId = $("#selectedUserId").val();
        var newPassword = $("#newPassword").val();
        
        if (!newPassword) {
            $("#changePasswordResult").html("<div class=\"alert alert-danger\">Please enter a new password.</div>");
            return;
        }
        
        if (newPassword.length < 6) {
            $("#changePasswordResult").html("<div class=\"alert alert-danger\">Password must be at least 6 characters long.</div>");
            return;
        }
        
        $("#changePasswordResult").html("<div class=\"alert alert-info\">Changing password...</div>");
        
        // Get the base URL and context path dynamically
        var currentPath = window.location.pathname;
        var pathParts = currentPath.split("/");
        var baseUrl = window.location.origin;
        var contextPath = "";
        
        // Find the context path and language code (usually after index.php)
        var indexPhpIndex = pathParts.indexOf("index.php");
        var languageCode = "en"; // default language
        if (indexPhpIndex !== -1) {
            if (pathParts[indexPhpIndex + 1]) {
                contextPath = "/" + pathParts[indexPhpIndex + 1];
            }
            if (pathParts[indexPhpIndex + 2]) {
                languageCode = pathParts[indexPhpIndex + 2];
            }
        }
        
        var updatePasswordUrl = baseUrl + "/index.php" + contextPath + "/" + languageCode + "/changePassword/updatePassword";
        
        // Make AJAX request to update password
        $.ajax({
            url: updatePasswordUrl,
            type: "POST",
            data: {
                userId: userId,
                newPassword: newPassword
            },
            dataType: "json",
            success: function(response) {
                if (response.status) {
                    $("#changePasswordResult").html("<div class=\"alert alert-success\">" + response.content + "</div>");
                    setTimeout(function() {
                        $("#passwordModal").hide();
                    }, 2000);
                } else {
                    $("#changePasswordResult").html("<div class=\"alert alert-danger\">" + response.content + "</div>");
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                console.error("Response:", xhr.responseText);
                $("#changePasswordResult").html("<div class=\"alert alert-danger\">Error updating password. Please try again.</div>");
            }
        });
    });
    
    // Initialize
    loadUsers();
});