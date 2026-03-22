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
        return '';
    }

    /**
     * Handle password update operation
     *
     * @param array $args
     * @param PKPRequest $request
     *
     * @return JSONMessage
     */
    public function updatePassword($args, $request)
    {
        
        // Get the user ID and new password from the request
        $userId = $request->getUserVar('userId');
        $newPassword = $request->getUserVar('newPassword');
        
        
        // Validate input
        if (!$userId || !$newPassword) {
            return new JSONMessage(false, __('plugins.generic.changePassword.error.missingData'));
        }
        
        if (strlen($newPassword) < 6) {
            return new JSONMessage(false, __('plugins.generic.changePassword.error.passwordTooShort'));
        }
        
        // Get the user from the repository
        $user = Repo::user()->get($userId);
        if (!$user) {
            return new JSONMessage(false, __('plugins.generic.changePassword.error.userNotFound'));
        }
        
        // Encrypt and set the new password
        $user->setPassword(Validation::encryptCredentials($user->getUsername(), $newPassword));
        
        // Save the user
        Repo::user()->edit($user, []);
        
        
        // Return success message
        return new JSONMessage(true, __('plugins.generic.changePassword.passwordChanged'));
    }
}