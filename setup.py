from setuptools import setup, find_packages

setup(
    name='realtimevis',
    description=(
        "Data visualisation for real-time transactions"),
    version=1.0,

    #TODO:
    #packages=find_packages(),
    #include_package_data=True,
    #zip_safe=False,
    #scripts=['superset/bin/superset'],

    install_requires=[
        'tornado',
        'kafka'
    ],
    author='Kusumakar Bodha',
    classifiers=[
        'Programming Language :: Python :: 2.7',
    ],
)