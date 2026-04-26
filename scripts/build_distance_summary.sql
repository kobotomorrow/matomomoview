INSTALL httpfs;
LOAD httpfs;

CREATE OR REPLACE SECRET source_s3 (
    TYPE s3,
    PROVIDER credential_chain,
    REGION 'ap-northeast-1'
);

COPY (
    WITH source_data AS (
        SELECT
            year,
            month,
            distance
        FROM read_parquet(getenv('RUNNING_DISTANCE_PARQUET_URI'))
        WHERE distance IS NOT NULL
    ),
    monthly AS (
        SELECT
            year,
            month,
            ROUND(SUM(distance) / 1000, 2) AS distance
        FROM source_data
        GROUP BY year, month
    ),
    total AS (
        SELECT
            ROUND(SUM(distance) / 1000, 2) AS distance
        FROM source_data
    )
    SELECT
        COALESCE((SELECT distance FROM total), 0) AS totalDistance,
        COALESCE(
            list(
                struct_pack(
                    year := year,
                    month := month,
                    distance := distance
                )
                ORDER BY year desc, month desc
            ),
            []
        ) AS monthlyDistance
    FROM monthly
) TO 'public/data/distance_summary.json' (FORMAT json, ARRAY true);
