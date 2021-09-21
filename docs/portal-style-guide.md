---
id: portal-style-guide
title: Style Guide
sidebar_label: Style Guide
description: Style guide for the Cardano developer portal.
image: ./img/og-developer-portal.png
---

You can write content using [GitHub-flavored Markdown syntax](https://github.github.com/gfm/). [Markdown](https://github.github.com/gfm/) is a way to style text on the web. You control the display of the document; formatting words as bold or italic, adding images, and creating lists are just a few of the things we can do with Markdown. Mostly, Markdown is just regular text with a few non-alphabetic characters thrown in, like `#` or `*`.

## Markdown Examples

This page will help you learn about the Markdown used in the Cardano Developer Portal, but the list is not intended to be exhaustive. Read the [docusaurus Markdown features](https://docusaurus.io/docs/next/markdown-features) for more examples.

Let's start with the basics:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="text"
  values={[
    {label: 'Text', value: 'text' },
    {label: 'Headers', value: 'headers' },
    {label: 'Links', value: 'links' },
    {label: 'Quotes', value: 'quotes' },
    {label: 'Images', value: 'images' },
    {label: 'Lists', value: 'lists' },
  ]}>
  <TabItem value="text">

```text
Emphasis, aka italics, with *asterisks* 
or _underscores_.

Strong emphasis, aka bold, with **asterisks** 
or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

You can even [link to the Forum!](https://forum.cardano.org)
```

Emphasis, aka italics, with *asterisks*
or _underscores_.

Strong emphasis, aka bold, with **asterisks**
or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

You can even [link to the Forum!](https://forum.cardano.org)

  </TabItem>
  <TabItem value="headers">

:::note Avoid top-level headings

`#Level 1` headings are rendered automatically from the `title` property of your `frontmatter`. <br /> Therefore use `## Level 2` headings as the top most heading in the docs.

:::

```md
---
id: front-matter
title: I am the frontmatter
description: Always include the frontmatter in your documents
---

## Structured documents

As a rule, it is useful to have different levels
of headings to structure your documents. Start rows 
with a `##` to create headings. Several `#` in a row 
indicate smaller heading sizes.

### This is a level 3 heading

#### This is a level 4 heading

You can use up to `######` six for different heading sizes.

```

# I am the frontmatter

## Structured documents

As a rule, it is useful to have different levels of headings to structure your documents. Start rows with a `#` to create headings. Several `##` in a row indicate smaller heading sizes.

### This is a level 3 heading

#### This is a level 4 heading

You can use up to `######` six for different heading sizes.

  </TabItem>
  <TabItem value="links">

```text
[I'm an inline-style link](https://forum.cardano.org)

[I'm an inline-style link with title](https://forum.cardano.org "Cardano Forum")

[I'm a reference-style link][arbitrary case-insensitive reference text]

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links. http://www.cardano.org or <http://www.cardano.org>.

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.cardano.org
[1]: https://forum.cardano.org
[link text itself]: https://www.cardano.org
```

[I'm an inline-style link](https://forum.cardano.org)

[I'm an inline-style link with title](https://forum.cardano.org "Cardano Forum")

[I'm a reference-style link][arbitrary case-insensitive reference text]

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links. http://www.cardano.org or <http://www.cardano.org>.

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.cardano.org
[1]: https://forum.cardano.org
[link text itself]: https://www.cardano.org

  </TabItem>
  <TabItem value="quotes">

```text
If you'd like to quote someone, use the > character 
before the line:

> It’s not about who’s first to market or how quickly 
we can upgrade something. It’s about what’s fit for 
purpose. - **Charles Hoskinson**
```

If you'd like to quote someone, use the > character before the line:

> It’s not about who’s first to market or how quickly we can upgrade something. It’s about what’s fit for purpose. - **Charles Hoskinson**

  </TabItem>
  <TabItem value="images">

```text
Here's is the Plutus logo (hover to see the title text):
Inline-style: ![alt text](../static/img/logo-plutus-small.png 'This is the Plutus logo inline-style')

Reference-style: ![alt text][logo]
[logo]: https://raw.githubusercontent.com/adam-p/markdown-here/master/src/common/images/icon48.png 'This is a logo reference-style'

Images from any folder can be used by providing path to file. Path should be relative to Markdown file:
![alt text](../static/img/logo-plutus.png)
```

Here's is the Plutus logo (hover to see the title text):
Inline-style: ![alt text](../static/img/logo-plutus-small.png 'This is the Plutus logo inline-style')

Reference-style: ![alt text][logo]
[logo]: https://raw.githubusercontent.com/adam-p/markdown-here/master/src/common/images/icon48.png 'This is a logo reference-style'

Images from any folder can be used by providing path to file. Path should be relative to Markdown file:
![alt text](../static/img/logo-plutus.png)

  </TabItem>
  <TabItem value="lists">

```text
1. First ordered list item
2. Another item
   - Unordered sub-list.
3. Actual numbers don't matter, just that it's a number
   1. Ordered sub-list
4. And another item.

* Unordered list can use asterisks

- Or minuses

+ Or pluses
```

1. First ordered list item
1. Another item
   - Unordered sub-list.
1. Actual numbers don't matter, just that it's a number
   1. Ordered sub-list
1. And another item.

<!-- -->

* Unordered list can use asterisks

- Or minuses

+ Or pluses

<!-- -->
  </TabItem>

</Tabs>

---

## Code

In the developer portal, you will often have to display code. You can display code with different syntax highlighting:
<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js' },
    {label: 'Python', value: 'py' },
    {label: 'C#', value: 'cs' },
    {label: 'JSON', value: 'json' },
    {label: 'Shell', value: 'sh' },
    {label: 'Text', value: 'txt' },
    {label: 'Extras', value: 'extras' },
  ]}>
<TabItem value="js">

    ```javascript
    var s = 'JavaScript syntax highlighting';
    alert(s);
    ```

```javascript
var s = 'JavaScript syntax highlighting';
alert(s);
```

</TabItem>
<TabItem value="py">

    ```python
    s = "Python syntax highlighting"
    print(s)
    ```

```python
s = "Python syntax highlighting"
print(s)
```

</TabItem>
<TabItem value="cs">

    ```csharp
    using System;
    var s = "c# syntax highlighting";
    Console.WriteLine(s);
    ```

```csharp
using System;
var s = "c# syntax highlighting";
Console.WriteLine(s);
```

</TabItem>
<TabItem value="json">

    ```json
    {
      "json_number": 225,
      "json_boolean": true,
      "json_string": "JSON syntax highlighting"
    }
    ```

```json
{
  "json_number": 225,
  "json_boolean": true,
  "json_string": "JSON syntax highlighting"
}
```

</TabItem>
<TabItem value="sh">

    ```shell
    ls 
    echo "Shell syntax highlighting"
    sudo dmesg
    top
    ```

```shell
ls 
echo "Shell syntax highlighting"
sudo dmesg
top
```

</TabItem>
<TabItem value="txt">

    ```
    No language indicated, so no syntax highlighting.
    But let's throw in a <b>tag</b>.
    ```

<!-- markdownlint-disable MD040-->
```
No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.
```
<!-- markdownlint-enable MD040-->

</TabItem>
<TabItem value="extras">

    ```javascript {2,3}
    function highlightMe() {
      console.log('This line can be highlighted!');
      console.log('You can also highlight multiple lines');
    }
    ```

```javascript {2,3}
function highlightMe() {
  console.log('This line can be highlighted!');
  console.log('You can also highlight multiple lines');
}
```

You can add a title to the code block by adding `title` key after the language (leave a space between them).

    ```jsx title="/src/components/HelloCodeTitle.js"
    function HelloCodeTitle(props) {
      return <h1>Hello, {props.name}</h1>;
    }
    ```

```jsx title="/src/components/HelloCodeTitle.js"
function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

  </TabItem>
</Tabs>

---

## Tabs

You can use tabs to display code examples in different languages. For example:

```html
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
```

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

---

## Synching tab choices

You can also switch multiple tabs at the same time based on user input:

```html
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
```

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

## Video embedding

Use this code to embed YouTube videos:

```html
<iframe width="100%" height="325" src="https://www.youtube.com/embed/U92Ks8rucDQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>
```

<iframe width="100%" height="325" src="https://www.youtube.com/embed/U92Ks8rucDQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

---

## Tables

Colons can be used to align columns:

```text
| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned |  $1600 |
| col 2 is      |   centered    |    $12 |
| zebra stripes |   are neat    |     $1 |
```

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned |  $1600 |
| col 2 is      |   centered    |    $12 |
| zebra stripes |   are neat    |     $1 |

There must be at least 3 dashes separating each header cell. The outer pipes (|) are optional, and you don't need to make the raw Markdown line up prettily. You can also use inline Markdown.

```text
| Markdown | Less      | Pretty     |
| -------- | --------- | ---------- |
| _Still_  | `renders` | **nicely** |
| 1        | 2         | 3          |
```

| Markdown | Less      | Pretty     |
| -------- | --------- | ---------- |
| _Still_  | `renders` | **nicely** |
| 1        | 2         | 3          |

---

## Inline HTML

Inline HTML is basically possible, but should be avoided for various reasons.

```html
<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>
```

<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>

---

## Line Breaks

```text
Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a _separate paragraph_.  
This line is a separate line in the _same paragraph_, created either by two blank spaces or explicit <br /> tag at the end of the previous line.
```

Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a _separate paragraph_.  
This line is a separate line in the _same paragraph_, created either by two blank spaces or explicit `<br />` tag at the end of the previous line.

---

## Admonitions

These different admonitions are available to you. As a general rule: don't overdo it and avoid using admonitions in a row.

<Tabs
  defaultValue="warning"
  values={[
    {label: 'Note', value: 'note'},
    {label: 'Tip', value: 'tip'},
    {label: 'Important', value: 'important'},
    {label: 'Caution', value: 'caution'},
    {label: 'Warning', value: 'warning'},
    {label: 'Custom', value: 'custom'},
  ]}>
  <TabItem value="note">

```text
:::note

This is a note

:::
```

:::note

This is a note

:::

  </TabItem>
  <TabItem value="tip">

```text
:::tip

This is a tip

:::
```

:::tip

This is a tip

:::

  </TabItem>
  <TabItem value="important">

```text
:::important

This is important

:::
```

:::important

This is important

:::

  </TabItem>
  <TabItem value="caution">

```text
:::caution

This is a caution

:::
```

:::caution

This is a caution

:::

  </TabItem>
  <TabItem value="warning">

```text
:::warning

This is a warning

:::
```

:::warning

This is a warning

:::

  </TabItem>
  <TabItem value="custom">

```text
:::tip Custom Title

This is a tip admonition with a custom title

:::
```

:::tip  Custom Title

This is a tip admonition with a custom title

:::

  </TabItem>
</Tabs>

Please try to avoid other style elements, and always keep in mind that people with visual handicaps should also be able to cope with your content.

## Editor extensions and configurations

Last but not least, let's talk about editors, extensions and configurations.

You can use any text editor you like to write Markdown. [Visual Studio Code](https://code.visualstudio.com/), [Sublime](https://www.sublimetext.com/), [Atom](https://atom.io/), etc. have plugins that help you adhere to style guides by displaying warnings if you break the rules.

Below are some extensions for these editors that help you write clean guides for the developer portal.

### markdownlint

Adds syntax highligting for Markdown files and display configurable warnings for invalid formatting.

<Tabs
  defaultValue="vscode"
  values={[
    {label: 'Visual Studio Code', value: 'vscode'},
    {label: 'Sublime', value: 'sublime'},
  ]}>
  <TabItem value="vscode">

* Install the extension via *Command Palette (Ctrl+P)* using `ext install DavidAnson.vscode-markdownlint`

* Add a `.markdownlint.json` file to your project with the following configuration.

```json
{
    "line-length": false,
    "MD004" : false,
    "MD033":{
        "allowed_elements": ["TabItem", "br", "iframe", "dl", "dt","dd", "em"]
    },
    "MD034" : false,
    "MD046" : false
}
```

  </TabItem>
  <TabItem value="sublime">

1. Install SublimeLinter as described [here](http://www.sublimelinter.com/en/stable/)
2. Install [Node.js](https://nodejs.org)
3. Install `markdownlint` by using `npm install -g markdownlint-cli`
4. Within Sublime Text's *Command Palette (Ctrl+Shift+P)* type `install` and select `Package Control: Install Package`.
5. When the plug-in list appears, type `markdownlint` and select `SublimeLinter-contrib-markdownlint`.

* Add a `.markdownlintrc` file to your project with the following configuration.

```json
{
    "line-length": false,
    "MD004" : false,
    "MD033":{
        "allowed_elements": ["TabItem", "br", "iframe", "dl", "dt","dd", "em"]
    },
    "MD034" : false,
    "MD046" : false
}
```

  </TabItem>
</Tabs>

### markdowntables

Helps you work with tables

<Tabs
  defaultValue="vscode"
  values={[
    {label: 'Visual Studio Code', value: 'vscode'}
  ]}>
  <TabItem value="vscode">

* Install the extension via *Command Palette (Ctrl+P)* using `ext install pharndt.vscode-markdown-table`

| Keybindings     |                            |
| --------------- | -------------------------- |
| `Ctrl+Q Ctrl+F` | format table under cursor. |
| `Ctrl+Q Space`  | clear cell under cursor.   |
| `Ctrl+Q Ctrl+Q` | toggle table mode          |

* In table mode

| Keybindings    |                                                |
| -------------- | ---------------------------------------------- |
| `Tab`          | navigate to the next cell in table             |
| `Shift+Tab`    | navigate to the previous cell in table         |
| `Alt+Numpad +` | Create new column left to the current position |
| `Alt+Numpad -` | delete current column                          |

  </TabItem>
</Tabs>

### rest-book

When you write guides for `cardano-wallet` or other components with an API, you might want to include the response for a certain request in your guide. It can be useful not to leave the environment of your editor as to not lose focus or get distracted. `rest-book` allows you to execute HTTP requests within your editor.

<Tabs
  defaultValue="vscode"
  values={[
    {label: 'Visual Studio Code', value: 'vscode'}
  ]}>

<TabItem value="vscode">

* Install the extension via *Command Palette (Ctrl+P)* using `ext install tanhakabir.rest-book`
* Open or create a `.restbook` file to use the extension.
  
</TabItem>

</Tabs>
