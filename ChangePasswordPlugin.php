<?php

/**
 * @file plugins/generic/changePassword/ChangePasswordPlugin.php
 *
 * @class ChangePasswordPlugin
 */

namespace APP\plugins\generic\changePassword;

// Ensure the feature class is available
require_once __DIR__ . '/ChangePasswordHandler.php';

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\core\PKPApplication;

class ChangePasswordPlugin extends GenericPlugin
{
    /**
     * @copydoc Plugin::register()
     */
    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);
        if ($success) {
            // Register locale data for translations
            $this->addLocaleData();
            
            // Register hooks - check if plugin is enabled for LoadHandler
            if ($this->getEnabled($mainContextId)) {
                Hook::add('LoadHandler', [$this, 'loadHandler']);
            }
            Hook::add('Template::Settings::access', [$this, 'addAccessTab']);
            
            // Add debug logging
            error_log("ChangePasswordPlugin: Plugin registered successfully. Enabled: " . ($this->getEnabled($mainContextId) ? 'true' : 'false'));
        }
        return $success;
    }

    /**
     * Load the handler for the change password page
     */
    public function loadHandler($hookName, $args)
    {
        
        $page = $args[0];
        $handler = &$args[3];
        
        
        if ($page === 'changePassword') {
            $handler = new ChangePasswordHandler();
            return true;
        }
        
        return false;
    }

    /**
     * Get the name of this plugin. The name must be unique within
     * its category.
     * @return String name of plugin
     */
    public function getName() {
        return 'changepassword';
    }
    public function getDisplayName()
    {
        return __('plugins.generic.changePassword.displayName');
    }

    /**
     * @copydoc Plugin::getDescription()
     */
    public function getDescription()
    {
        return __('plugins.generic.changePassword.description');
    }

    /**
     * @copydoc Plugin::getActions()
     */
    public function getActions($request, $verb)
    {
        $router = $request->getRouter();
        return array_merge(
            $this->getEnabled() ? [] : [],
            parent::getActions($request, $verb)
        );
    }

  

    /**
     * Add change password tab to access settings
     */
    public function addAccessTab($hookName, $args)
    {
        
        $templateMgr = $args[1];
        $output = &$args[2];
        $request = PKPApplication::get()->getRequest();
        
        // Create a comprehensive tab content with table, pagination, and search
        $tabContent = '<div class="pkp_page_content">
            <h2>' . __('plugins.generic.changePassword.displayName') . '</h2>
            <p>' . __('plugins.generic.changePassword.description') . '</p>
            <div class="section">
                <h3>Change User Password</h3>
                
                <!-- Search Box -->
                <div class="flex-shrink-0">
                            <div class="flex gap-x-2">
                                <div class="pkpSearch">
                                    <label>
                                        <span class="-screenReader">Enter a user name, role (e.g Journal editor), or affiliation</span>
                                        <input id="userSearch" type="search" class="pkpSearch__input" placeholder="Enter a user name, role (e.g Journal editor), or affiliation" value="">
                                        <span class="pkpSearch__icons">
                                            <span class="inline-block align-middle rtl:scale-x-[-1] absolute left-2/4 top-2/4 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform text-primary">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15.5 14H14.71L14.43 13.73C15.4439 12.554 16.0011 11.0527 16 9.5C16 8.21442 15.6188 6.95772 14.9046 5.8888C14.1903 4.81988 13.1752 3.98676 11.9874 3.49479C10.7997 3.00282 9.49279 2.87409 8.23192 3.1249C6.97104 3.3757 5.81285 3.99477 4.90381 4.90381C3.99477 5.81285 3.3757 6.97104 3.1249 8.23192C2.87409 9.49279 3.00282 10.7997 3.49479 11.9874C3.98676 13.1752 4.81988 14.1903 5.8888 14.9046C6.95772 15.6188 8.21442 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"></path>
                                                </svg>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                
                <!-- Users Table -->
                <div class="table-responsive">
                    <table class="w-full max-w-full border-separate border-spacing-0" id="usersTable">
                        <thead>
                            <tr calss="bg bg-default" >
                                <th scope="col" class="px-2 py-4 uppercase whitespace-nowrap border-t border-b border-light text-start text-base-normal text-heading first:border-s first:ps-3 last:border-e last:pe-3"><span class="">UserName</span></th>
                                <th scope="col" class="px-2 py-4 uppercase whitespace-nowrap border-t border-b border-light text-start text-base-normal text-heading first:border-s first:ps-3 last:border-e last:pe-3"><span class="">Email</span></th>
                                <th scope="col" class="px-2 py-4 uppercase whitespace-nowrap border-t border-b border-light text-start text-base-normal text-heading first:border-s first:ps-3 last:border-e last:pe-3"><span class="">Name</span></th>
                                <th scope="col" class="px-2 py-4 uppercase whitespace-nowrap border-t border-b border-light text-start text-base-normal text-heading first:border-s first:ps-3 last:border-e last:pe-3"><span class="">Roles</span></th>
                               <th scope="col" class="px-2 py-4 uppercase whitespace-nowrap border-t border-b border-light text-start text-base-normal text-heading first:border-s first:ps-3 last:border-e last:pe-3"><span class="">Action</span></th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <tr>
                                <td colspan="5" class="text-center">Loading users...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="flex justify-between items-center px-2 py-2 border-b border-x border-light">
                    <span id="resultsCounter">Showing <strong>1 to 25</strong> of 0</span>
                    <nav class="pkpPagination" role="navigation" aria-label="View additional pages">
                        <ul id="paginationList">
                            <li>
                                <button class="pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded" 
                                        type="button" id="prevBtn" disabled aria-label="Go to Previous">
                                    Previous
                                </button>
                            </li>
                            <li>
                                <button class="pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded pkpPagination__page" 
                                        type="button" aria-label="Go to Page 1" aria-current="true" data-page="1">
                                    1
                                </button>
                            </li>
                            <li>
                                <button class="pkpButton inline-flex relative items-center gap-x-1 border-transparent hover:enabled:underline disabled:text-disabled text-lg-medium text-primary border-light hover:text-hover disabled:text-disabled py-[0.4375rem] px-3 border rounded" 
                                        type="button" id="nextBtn">
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                
                <!-- Password Change Modal -->
                <div id="passwordModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
                    <div style="background-color: white; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 400px; border-radius: 5px;">
                        <h4>Change Password for <span id="selectedUserName"></span></h4>
                        <form class="pkp_form" id="changePasswordForm">
                        <div class="section">
                            <input type="hidden" id="selectedUserId" name="userId">
                            <div class="pkp_helpers_half" style="margin-bottom: 15px;">
                                <label for="newPassword">New Password:</label>
                                <input type="password" id="newPassword" name="newPassword" class="field text required" required>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="pkp_button submitFormButton">Change Password</button>
                                <button type="button" id="cancelModal" class="pkp_button submitFormButton" style="margin-left: 10px;">Cancel</button>
                            </div>
                            </div>
                        </form>
                        <div id="changePasswordResult" style="margin-top: 15px;"></div>
                    </div>
                </div>
            </div>
            
                       
            <script type="text/javascript" src="' . $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/changePassword.js"></script>
        </div>';
        
        $output .= '<tab id="changePassword" label="' . __('plugins.generic.changePassword.displayName') . '">' . $tabContent . '</tab>';
        
        
        return false;
    }
}