$(document).ready(function() {
    var currentPage = 1;
    var usersPerPage = 25; // Changed to match API standard
    var allUsers = [];
    var filteredUsers = [];
    var selectedUser = null;
    var totalUsers = 0; // Track total users from server
    var currentSearchTerm = ""; // Track current search term
    
    // Load users from API with server-side pagination
    function loadUsers(page = 1, searchTerm = "") {
        var statusDiv = document.getElementById("usersTableBody");
        statusDiv.innerHTML = "<tr><td colspan=\"5\" class=\"text-center\"><div class=\"pkp_spinner\"></div> Loading users...</td></tr>";
        
        // Get the base URL and context path dynamically
        var baseUrl = window.location.protocol + "//" + window.location.host;
        console.log("ChangePasswordPlugin: loadUsers - baseUrl:", baseUrl);

        var pathParts = window.location.pathname.split("/").filter(function(part) { return part !== ""; });
        var contextPath = "";
        console.log("ChangePasswordPlugin: loadUsers - pathParts:", pathParts);
        
        // Find the context path (usually after index.php)
        var indexPhpIndex = pathParts.indexOf("index.php");
        if (indexPhpIndex !== -1 && pathParts.length > indexPhpIndex + 1) {
            contextPath = pathParts[indexPhpIndex + 1];
        }
        
        // Calculate offset for server-side pagination
        var offset = (page - 1) * usersPerPage;
        
        // Construct the API URL with proper pagination parameters
        var searchParam = searchTerm ? "searchPhrase=" + encodeURIComponent(searchTerm) : "searchPhrase";
        var apiUrl = contextPath ? 
            baseUrl + "/index.php/" + contextPath + "/api/v1/users?" + searchParam + "&status=all&includePermissions=true&offset=" + offset + "&count=" + usersPerPage + "&page=" + page + "&perPage=" + usersPerPage :
            baseUrl + "/api/v1/users?" + searchParam + "&status=all&includePermissions=true&offset=" + offset + "&count=" + usersPerPage + "&page=" + page + "&perPage=" + usersPerPage;
        
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
                        filteredUsers = allUsers; // For server-side pagination, these are the same
                        totalUsers = data.itemsMax || data.total || data.items.length; // Get total from server
                        currentPage = page;
                        currentSearchTerm = searchTerm;
                        displayUsers();
                        updatePagination();
                        $("#changePasswordResult").html("<div class=\"alert alert-success\">Loaded " + data.items.length + " users (Page " + page + " of " + Math.ceil(totalUsers / usersPerPage) + ", Total: " + totalUsers + ")</div>");
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
        var tbody = $("#usersTableBody");
        tbody.empty();
        
        if (allUsers.length === 0) {
            tbody.append("<tr><td colspan=\"5\" class=\"text-center\">No users found</td></tr>");
            return;
        }
        
        // Display all users from current page (server already filtered them)
        allUsers.forEach(function(user) {
            var username = user.userName || user.username || user.name || "N/A";
            var email = user.email || user.emailAddress || "N/A";
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
            
            var row = "<tr class=\"border border-separate border-light even:bg-tertiary\">" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + username + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + email + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + fullName + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + roles + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\">" +
                "<button class=\"pkpButton pkpButton--isPrimary change-password-btn\" data-user-id=\"" + user.id + "\" data-username=\"" + username + "\">Change Password</button>" +
                "</td></tr>";
            tbody.append(row);
        });
    }

    // Update pagination controls for server-side pagination
    function updatePagination() {
        var totalPages = Math.ceil(totalUsers / usersPerPage);
        var startIndex = (currentPage - 1) * usersPerPage + 1;
        var endIndex = Math.min(currentPage * usersPerPage, totalUsers);
        
        // Update info - handle case when no users
        if (totalUsers === 0) {
            $("#paginationInfo").text("Showing 0 users");
        } else {
            $("#paginationInfo").text("Showing " + startIndex + " - " + endIndex + " of " + totalUsers + " users");
        }
        
        // Update buttons
        $("#prevPage").prop("disabled", currentPage <= 1);
        $("#nextPage").prop("disabled", currentPage >= totalPages || totalPages === 0);
        
        // Update page numbers
        var pageNumbersHtml = "";
        if (totalPages > 0) {
            var startPage = Math.max(1, currentPage - 2);
            var endPage = Math.min(totalPages, currentPage + 2);
            
            for (var i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    pageNumbersHtml += "<button class=\"pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded pkpPagination__page\" type=\"button\" aria-label=\"Go to Page " + i + "\" aria-current=\"true\" data-page=\"" + i + "\" style=\"background-color: #e5e7eb;\">" + i + "</button> ";
                } else {
                    pageNumbersHtml += "<button class=\"pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded page-link\" type=\"button\" aria-label=\"Go to Page " + i + "\" data-page=\"" + i + "\">" + i + "</button> ";
                }
            }
        } else {
            pageNumbersHtml = "<button class=\"pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded pkpPagination__page\" type=\"button\" aria-label=\"Go to Page 1\" aria-current=\"true\" data-page=\"1\" disabled>1</button>";
        }
        $("#pageNumbers").html(pageNumbersHtml);
    }

    // Search functionality with server-side filtering
    $("#userSearch").on("input", function() {
        var searchTerm = $(this).val().toLowerCase();
        // Load users from server with search term
        loadUsers(1, searchTerm);
    });

    // Display users (simplified for server-side pagination)
    function displayUsers() {
        var tbody = $("#usersTableBody");
        tbody.empty();
        
        if (allUsers.length === 0) {
            tbody.append("<tr><td colspan=\"5\" class=\"text-center\">No users found</td></tr>");
            return;
        }
        
        // Display all users from current page (server already filtered them)
        allUsers.forEach(function(user) {
            var username = user.userName || user.username || user.name || "N/A";
            var email = user.email || user.emailAddress || "N/A";
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
            
            var row = "<tr class=\"border border-separate border-light even:bg-tertiary\">" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + username + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + email + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + fullName + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\"> <span class=\"text-base-normal\">" + roles + "</span></td>" +
                "<td scope=\"false\" class=\"px-2 py-2 border-b border-light text-start text-base-normal first:border-s first:ps-3 last:border-e last:pe-3\">" +
                "<button class=\"pkp_button submitFormButton change-password-btn\" data-user-id=\"" + user.id + "\" data-username=\"" + username + "\">Change Password</button>" +
                "</td></tr>";
            tbody.append(row);
        });
    }

    // Pagination event handlers - updated for server-side pagination
    $(document).on("click", "#prevPage", function() {
        if (currentPage > 1) {
            loadUsers(currentPage - 1, currentSearchTerm);
        }
    });

    $(document).on("click", "#nextPage", function() {
        var totalPages = Math.ceil(totalUsers / usersPerPage);
        if (currentPage < totalPages) {
            loadUsers(currentPage + 1, currentSearchTerm);
        }
    });

    $(document).on("click", ".page-link", function(e) {
        e.preventDefault();
        var page = parseInt($(this).data("page"));
        if (page && page !== currentPage) {
            loadUsers(page, currentSearchTerm);
        }
    });
    
    // Change password button clicks
    $(document).on("click", ".change-password-btn", function() {
        var userId = $(this).data("user-id");
        var userName = $(this).data("username"); // Fixed: changed from user-name to username
        
        console.log("Button clicked - userId:", userId, "userName:", userName);
        
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
        
        console.log("Form submission - userId:", userId, "password length:", newPassword ? newPassword.length : 0);
        
        if (!userId) {
            $("#changePasswordResult").html("<div class=\"alert alert-danger\">Please select a user first.</div>");
            return;
        }
        
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
        var pathParts = currentPath.split("/").filter(function(part) { return part !== ""; });
        var baseUrl = window.location.origin;
        var contextPath = "";
        var languageCode = "en"; // default language
        
        console.log("URL construction - currentPath:", currentPath);
        console.log("URL construction - pathParts:", pathParts);
        
        // Find the context path and language code (usually after index.php)
        var indexPhpIndex = pathParts.indexOf("index.php");
        if (indexPhpIndex !== -1 && pathParts.length > indexPhpIndex + 1) {
            // The part immediately after index.php is the context (journal/conference name)
            contextPath = "/" + pathParts[indexPhpIndex + 1];
            
            // Check if there's a language code in the current URL
            if (pathParts.length > indexPhpIndex + 2) {
                var potentialLangCode = pathParts[indexPhpIndex + 2];
                // Common language codes pattern (2-5 characters)
                if (potentialLangCode.match(/^[a-z]{2}(_[A-Z]{2})?$/)) {
                    languageCode = potentialLangCode;
                } else {
                    // No language code in URL, don't add one
                    languageCode = "";
                }
            } else {
                // No language code in URL, don't add one
                languageCode = "";
            }
        }
        
        // Construct URL - only add language code if it exists in current URL
        var updatePasswordUrl = baseUrl + "/index.php" + contextPath + 
            (languageCode ? "/" + languageCode : "") + "/changePassword/updatePassword";
        
        console.log("Final URL:", updatePasswordUrl);
        console.log("Sending data - userId:", userId, "newPassword length:", newPassword.length);
        
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