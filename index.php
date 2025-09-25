<?php

/**
 * @file plugins/generic/changePassword/index.php
 *
 * Copyright (c) 2025 Abdul Hadi M.Alaidi 
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @ingroup plugins_generic_changePassword
 * @brief Wrapper for Change Password plugin.
 *
 */

require_once('ChangePasswordPlugin.php');

return new APP\plugins\generic\changePassword\ChangePasswordPlugin();

?>