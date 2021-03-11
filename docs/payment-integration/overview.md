---
id: overview
title: Payment Integration
sidebar_label: Overview
description: Payment Integration
image: ./img/og-developer-portal.png
--- 

This is just a placeholder page. 

## Code Examples
Example to present different examples in different languages.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js'},
    {label: 'PHP', value: 'php'},
    {label: 'Python', value: 'py'},
  ]}>
  <TabItem value="js">

```js
  function helloWorld() {
    console.log('Hello, world!');
  }
```

  </TabItem>
  <TabItem value="php">

```php
  <?php echo '<p>Hello, world!</p>'; ?>
```

  </TabItem>
  <TabItem value="py">

```py
def hello_world():
  print 'Hello, world!'
```

  </TabItem>
</Tabs>

:::note
Note that the empty lines above and below each language block (in the *md file) is intentional. 
:::



## Additional example

We should do the same with for example operating systems. We can also switch multiple tabs at the same time based on user input.

<Tabs
  groupId="operating-systems"
  defaultValue="win"
  values={[
    {label: 'Windows', value: 'win'},
    {label: 'macOS', value: 'mac'},
    {label: 'Linux', value: 'linux'},
  ]
}>
<TabItem value="win">Use Ctrl + C to copy.</TabItem>
<TabItem value="mac">Use Command + C to copy.</TabItem>
<TabItem value="linux">Use Ctrl + C to copy.</TabItem>
</Tabs>

<Tabs
  groupId="operating-systems"
  defaultValue="win"
  values={[
    {label: 'Windows', value: 'win'},
    {label: 'macOS', value: 'mac'},
    {label: 'Linux', value: 'linux'},
  ]
}>
<TabItem value="win">Use Ctrl + V to paste.</TabItem>
<TabItem value="mac">Use Command + V to paste.</TabItem>
<TabItem value="linux">Use Ctrl + V to paste.</TabItem>
</Tabs>