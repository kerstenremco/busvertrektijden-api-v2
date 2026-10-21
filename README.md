## Busvertrektijden API

### Setup

#### Database

1. Create PostgreSQL database
2. Execute SQL queries in `sql/init.sql` to create the necessary tables, indexes, views and functions.

### Update data

```python
cd sql
python update.py -d # download source file
python update.py -e # extract source file
python update.py -i # import to staging tables
python update.py -p # import to production tables
python update.py -c # cleanup temporary files
```
