<?php

/**
 * @file plugins/generic/changePassword/ChangePasswordHandler.php
 *
 * Copyright (c) 2025 Abdul Hadi M.Alaidi 
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class ChangePasswordHandler
 * @ingroup plugins_generic_changePassword
 *
 * @brief Handler for change password operations
 */

namespace APP\plugins\generic\changePassword;

use PKP\handler\PKPHandler;
use PKP\core\JSONMessage;
use PKP\security\authorization\ContextAccessPolicy;
use PKP\core\PKPRequest;
use PKP\security\Role;
use APP\facades\Repo;
use PKP\security\Validation;

class ChangePasswordHandler extends PKPHandler
{
    /**
     * Constructor.
     */
    public function __construct()
    {
        parent::__construct();
        
        // Add role assignments for authorization
        $this->addRoleAssignment(
            [Role::ROLE_ID_SITE_ADMIN, Role::ROLE_ID_MANAGER],
            ['index', 'changePassword', 'updatePassword']
        );
    }

    /**
     * @copydoc PKPHandler::authorize()
     */
    public function authorize($request, &$args, $roleAssignments)
    {
        // Require user to be logged in
        $this->addPolicy(new \PKP\security\authorization\UserRequiredPolicy($request));
        
        // Use context access policy for journal-level access
        $this->addPolicy(new ContextAccessPolicy($request, $roleAssignments));
        
        return parent::authorize($request, $args, $roleAssignments);
    }

    /**
     * Display the change password page with user list
     *
     * @param array $args
     * @param PKPRequest $request
     *
     * @return string Template output
     */
    public function index($args, $request)
     {
     }

  

    /**
     * Update the user's password
     *
     * @param array $args
     * @param PKPRequest $request
     *
     * @return JSONMessage JSON object
     */
    public function updatePassword($args, $request)
    {
        // Debug: Log all received parameters
        
        // Get userId from POST data (from AJAX request)
        $userId = (int) $request->getUserVar('userId');
        $newPassword = $request->getUserVar('newPassword');
        
        
        if (!$userId || !$newPassword) {
            return new JSONMessage(false, 'Missing required parameters');
        }
        
        $user = Repo::user()->get($userId, true);

        if (!$user) {
            return new JSONMessage(false, 'User not found');
        }

        // Validate password length
        if (strlen($newPassword) < 6) {
            return new JSONMessage(false, 'Password must be at least 6 characters long');
        }

        // Update the user's password
        $user->setPassword(Validation::encryptCredentials($user->getUsername(), $newPassword));
        
        // Save the user
        Repo::user()->edit($user, []);
        
        return new JSONMessage(true, 'Password updated successfully');
    }
}