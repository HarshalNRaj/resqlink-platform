import pymysql

# Django checks the driver version even though PyMySQL provides the compatible
# MySQLdb interface used by the configured backend.
pymysql.version_info = (2, 2, 1)
pymysql.__version__ = "2.2.1"
pymysql.install_as_MySQLdb()