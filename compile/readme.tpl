<%= indent %># <%= framework.name %> <%= framework.version %>

<%= framework.description %>


<%= indent %>## Status
<%= framework.meta.status %>


<%= indent %>## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [<%= framework.homepage %>](<%= framework.homepage %>) |
| Git        | [<%= framework.repository.url %>](<%= framework.repository.url %>) |
| Repository | [<%= framework.repository.url.replace("git://", "http://").replace(".git", "") %>](<%= framework.repository.url.replace("git://", "http://").replace(".git", "") %>) |

<% if (framework.meta.compatability) { %>
<%= indent %>## Compatability (Tested)
| Target | Versions |
| :----- | -------: |
<% for (var key in framework.meta.compatability) { %>| <%= key %> | <%= framework.meta.compatability[key] %> |
<% } %><% } %>
<% if (framework.meta.cdn) { %>
<%= indent %>## CDN
| Resource | URL |
| :----- | -------: |
<% for (var key in framework.meta.cdn) { %>| <%= key %> | [<%= framework.meta.cdn[key] %>](<%= framework.meta.cdn[key] %>) |
<% } %><% } %>
<% if (framework.meta.tests) { %>
<%= indent %>## Unit Tests
| Resource | URL |
| :----- | -------: |
<% for (var key in framework.meta.tests) { %>| <%= key %> | [Run](<%= framework.meta.tests[key] %>) |
<% } %><% } %>
<% if (framework.meta.dependencies) { %>
<%= indent %>## Dependencies
| Name | URL |
| :----- | -------: |
<% for (var key in framework.meta.dependencies) { %>| <%= key %> | [Open](<%= framework.meta.dependencies[key] %>) |
<% } %><% } %>
<% if (framework.meta.weakDependencies) { %>
<%= indent %>## Weak Dependencies
| Name | URL |
| :----- | -------: |
<% for (var key in framework.meta.weakDependencies) { %>| <%= key %> | [Open](<%= framework.meta.weakDependencies[key] %>) |
<% } %><% } %>

<%= indent %>## Contributors
<% framework.contributors.forEach(function (contributor) { %>
- <%= contributor %><% }) %>


<%= indent %>## License

<%= framework.license %>


<% if (framework.meta.credits) { %><%= indent %>## Credits

This software may include modified and unmodified portions of:<% framework.meta.credits.forEach(function (credit) { %>
- <%= credit %><% }) %>
<% } %>