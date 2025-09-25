# Change Password Plugin - Troubleshooting Guide

## Plugin Works Locally But Not on Target OJS Installation

### Step 1: Verify Plugin Installation
1. **Check file structure** on target server:
   ```
   plugins/generic/changePassword/
   ├── ChangePasswordHandler.php
   ├── ChangePasswordPlugin.php
   ├── version.xml
   ├── settings.xml
   ├── js/changePassword.js
   └── locale/en/locale.po
   ```

2. **Verify file permissions**:
   ```bash
   chmod -R 755 plugins/generic/changePassword/
   chown -R [webserver-user]:[webserver-group] plugins/generic/changePassword/
   ```

### Step 2: Check Plugin Activation
1. Login as admin to target OJS
2. Go to **Settings > Website > Plugins > Generic Plugins**
3. Find "Change Password Plugin"
4. Ensure it shows as **enabled** (green checkmark)
5. If not visible, check error logs

### Step 3: Clear Cache
```bash
# Method 1: Command line
rm -rf cache/*

# Method 2: Admin panel
Administration > Clear Cache
```

### Step 4: Check Error Logs
Look for errors in:
- `error.log` (web server)
- `php_errors.log` (OJS directory)
- Browser console (F12 > Console)

Common error patterns:
```
PHP Fatal error: Class 'APP\plugins\generic\changePassword\ChangePasswordPlugin' not found
PHP Parse error: syntax error in ChangePasswordPlugin.php
Permission denied: plugins/generic/changePassword/
```

### Step 5: Verify OJS Version Compatibility
1. Check OJS version: **Help > About**
2. Plugin requires: **OJS 3.1.1+**
3. If version is older, plugin may not work

### Step 6: Database Check
Check if plugin is registered in database:
```sql
SELECT * FROM plugin_settings WHERE plugin_name = 'changepassword';
```

### Step 7: Debug Plugin Registration
Add temporary debug logging to `ChangePasswordPlugin.php`:
```php
public function register($category, $path, $mainContextId = null)
{
    error_log("ChangePasswordPlugin: Attempting to register plugin");
    $success = parent::register($category, $path, $mainContextId);
    error_log("ChangePasswordPlugin: Registration " . ($success ? "successful" : "failed"));
    return $success;
}
```

### Step 8: Check Hook Registration
Verify the LoadHandler hook is being called:
```php
public function loadHandler($hookName, $args)
{
    error_log("ChangePasswordPlugin: LoadHandler called for page: " . $args[0]);
    // ... rest of method
}
```

### Step 9: Verify Tab Display
If plugin is active but tab doesn't appear:
1. Check user permissions (must be admin/manager)
2. Verify hook `Template::Settings::access` is working
3. Check browser console for JavaScript errors

### Step 10: Manual Plugin Activation
If automatic activation fails, try manual database insertion:
```sql
INSERT INTO plugin_settings (plugin_name, context_id, setting_name, setting_value, setting_type) 
VALUES ('changepassword', 0, 'enabled', '1', 'bool');
```

## Common Solutions

### Solution 1: Namespace Issues
Ensure all PHP files use correct namespace:
```php
namespace APP\plugins\generic\changePassword;
```

### Solution 2: Autoloader Issues
Add explicit require statements:
```php
require_once __DIR__ . '/ChangePasswordHandler.php';
```

### Solution 3: Hook Priority
If hooks conflict, try different priority:
```php
Hook::add('LoadHandler', [$this, 'loadHandler'], HOOK_SEQUENCE_CORE);
```

### Solution 4: Context-Specific Issues
Check if plugin needs to be enabled per journal:
```php
if ($this->getEnabled($mainContextId)) {
    // Plugin logic
}
```

## Testing Steps

1. **Basic functionality**: Can you see the plugin in the plugin list?
2. **Activation**: Does the plugin activate without errors?
3. **Tab display**: Does the "Change Password" tab appear in Settings > Access?
4. **Page access**: Can you access `/changePassword` URL?
5. **JavaScript**: Are there any console errors?

## Contact Information

If issues persist, provide:
- OJS version
- PHP version
- Error log contents
- Plugin installation method
- Server environment details