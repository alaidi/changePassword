# Change Password Plugin

A plugin for [OJS 3.1.1+](https://github.com/pkp/ojs) which allows administrators to change user passwords through a web interface.

This plugin allows administrators to change user passwords from the OJS backend.

## Disclaimer

This plugin was developed using AI tools. While efforts have been made to ensure quality and functionality, the developers are not responsible for any errors or issues that may arise from its use. Please use at your own risk and thoroughly test before deployment in a production environment.

## Version History

- **v1.1.3** (2025-09-28)
  - Added versioning to the JavaScript file to prevent caching issues.
- **v1.1.2** (2025-09-28)
  - Fixed plugin name registration in the database.
- **v1.1.1** (2025-09-27)
  - Compatibility with OJS 3.5.0.
- **v1.1.0** (2025-09-27)
  - Improved stability and bug fixes.
- **v1.0.0** (2025-09-01)
  - Initial release.

## Features

- Web-based interface for changing user passwords
- AJAX-powered password updates
- Role-based access control (Site Administrators and Managers)
- Password validation (minimum 6 characters)
- Real-time feedback on password changes

## Usage

1. Install and activate this plugin from the plugin gallery in your [OJS](https://github.com/pkp/ojs) installation. The plugin gallery can be found by logging in as an admin and going to **Settings > Website > Plugins > Plugin Gallery**.

2. Once activated, administrators can access the password change functionality through the plugin interface.

3. Select a user from the list and enter a new password (minimum 6 characters required).

4. The password will be updated immediately with confirmation feedback.

## Access Requirements

This plugin requires one of the following roles to access:
- Site Administrator
- Journal Manager

## Technical Details

The plugin consists of:
- `ChangePasswordPlugin.php` - Main plugin class with hook registration
- `ChangePasswordHandler.php` - Request handler for password operations
- `changePassword.js` - Frontend JavaScript for user interaction

## License

This plugin is licensed under the GNU General Public License v2.

## Compatibility

This plugin is compatible with OJS 3.1.1 and later versions. For specific version compatibility, ensure your OJS installation supports the required plugin architecture and user management features.
