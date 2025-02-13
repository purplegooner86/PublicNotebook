# SQLMap Essentials

SQLMap is a free and open-source tool written in Python that automates the process of exploiting SQL injection vulnerabilities  

Installation:  
- `sudo apt install sqlmap`  

SQLMap has the largest support for DBMSes of any SQL exploitation tool. It currently supports all of the following DBMSs:  

MySQL, Oracle, PostgreSQL, Microsoft SQL Server, SQLite, IBM DB2, Microsoft Access, Firebird, Sybase, SAP MaxDB, Informix, MariaDB,HSQLDB, CockroachDB, TiDB, MemSQL, H2, MonetDB, Apache Derby, Amazon Redshift, Vertica, Mckoi, Presto, Altibase, MimerSQL, CrateDB,Greenplum, Drizzle, Apache Ignite, Cubrid, InterSystems Cache, IRIS, eXtremeDB, FrontBase  

<br />

## Injection Types  

`sqlmap -hh` and then search for "Techniques" will show us the different injection types sqlmap is capable of  

The techniques `BEUSTQ` refer to the following:  
- `B`: Boolean-based blind
- `E`: Error-based  
- `U`: Union query-based  
- `S`: Stacked queries  
- `T`: Time-based blind  
- `Q`: Inline queries  

<br />

### Boolean-based blind SQL Injection

Boolean-based blind SQL injection techniques use the differentiation of TRUE from FALSE query results, effectively retrieving 1 byte of information per request  
This is considered as the most common SQL injection type in web applications  

<br />

### Error-based SQL Injection  

If the DBMS errors are being returned as part of the server response for any database-related problems, there is a probability that they can be used to carry the results for requested queries  
SQLMap can use Error-based SQL Injection for the following DBMSs:  
MySQL, Microsoft SQL Server, IBM DB2, PostgreSQL, Sybase, Firebird, Oracle, Vertica, MonetDB  

Error-based SQL injection is considered faster than all other types, except UNION query-based, because it can retrieve chunks of data through each request  

<br /> 

### UNION query-based SQL Injection

With the usage of UNION, the original vulnerable query is extended with the injected statement's results. This type of SQL injection is considered the fastest, as, in the ideal scenario, the attacker would be able to pull the content of the whole database table of interest with a single request  

<br />

### Stacked queries SQL Injection

Stacking SQL queries, also known as "piggy-backing" is the form of injecting additional SQL statements after the vulnerable one. SQLMap can use this technique to run non-query statements executing advanced features (e.g execution of OS commands) and data retrieval similarly to time-based blind SQL injection types  

<br />

### Time-based blind SQL Injection

The principle behind Time-based blind SQL injection is similar to boolean-based blind SQL injection, but the response time is used as the source for the differentiation between TRUE and FALSE  
It is considerably slower than boolean-based  

<br />

### Inline queries SQL Injection

This type of injection imbeds a query within the original query. It is uncommon, because the vulnerable web app needs to be written a certain way  

<br />

### Out-of-band SQL Injection

This is considered one of the most advanced types of SQL injection, used in cases where all other types are either unsupported or too slow. SQLMap supports out-of-band SQL injection through "DNS exfiltration" where requested queries are retrieved through DNS traffic. By running SQLMap on the DNS server for the domain under control SQLMap can force the server to request non-existent subdomains (e.g foo.victim.com) where foo would be the SQL response we want to receive. SQLMap can then collect these erroring DNS requests and collect the foo part, to form the entire SQL response  

<br />

## Understanding SQLMap Log Messages

### URL content is stable

Log message:  
- "target URL content is stable"  

This means that there are no major changes between responses for continuous identical requests. While stability is important, SQLMap has advanced mechanisms to automatically remove the potential "noise" that could come from potentially unstable targets  

<br />

### Parameter appears to be dynamic

Log message:
- "GET parameter 'id' appears to be dynamic"  

We want the tested parameter to be "dynamic" because it means that changes made to its value result in a change in the response; hence the parameter may be linked to a database  

<br />

### Parameter might be injectable

Log message:
- "heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')"  

This is not proof of SQLi, but a solid indication that the parameter might be injectable  

<br />

### Parameter appears to be injectable

Log message:
- "GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable (with --string="luther")"  

This message indicates that the parameter appears to be injectable, though there is still a chance for it to be a false-positive finding. 

<br />

### Parameter might be vulnerable to XSS attacks

Log message:
- "heuristic (XSS) test shows that GET parameter 'id' might be vulnerable to cross-site scripting (XSS) attacks"  

SQLMap's purpose is not to find XSS vulnerabilities, but it runs a quick heuristic to check for the prescence of XSS vulnerabilities

<br />

### Reflective values found

Log message:
- "reflective value(s) found and filtering out"  

Just a warning that parts of the used payloads are found in the response. This behavior could cause problems to automation tools, as it represents the junk. However, SQLMap has filtering mechanisms to remove such junk before comparing the original page content  

<br />

### Time-based comparison statistical model

Log message:
- "time-based comparison requires a larger statistical model, please wait........... (done)"  

SQLMap uses a statistical model for the recognition of regular and (deliberately) delayed target responses. For this model to work, it needs to collect a sufficiently large number of regular response times  

<br />

### Extending UNION query injection technique tests

Log message:  
- automatically extending ranges for UNION query injection technique tests as there is at least one other (potential) technique found"

UNION-query SQLi checks require considerably more requests for successful recognition of usable payload than other SQL injection types  

<br />

### SQLmap identified injection points

Log message:  
- "sqlmap identified the following injection point(s) with a total of 46 HTTP(s) requests:"  

It should be noted that SQLMap lists only those findings which are provably exploitable  

