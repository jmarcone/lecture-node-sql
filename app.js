import Express from "express";
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgres://kbnonjfk:tKf5p9oUgNyTmsmIn0HHCnlcN5S1B0tC@mel.db.elephantsql.com/kbnonjfk'
});

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app
    .get("/", async (req, res) => {
        try {
            const { rows: cats } = await pool.query("SELECT * FROM cats WHERE deleted = FALSE");

            console.log(cats);
            res.json(cats);
        } catch (e) {
            console.error(e.message);
            res.json({ error: e.message })
        }
    }
    )
    .post("/", async (req, res) => {
        try {
            const { name, age } = req.body;
            if (!name || !age)
                return res.json({ error: "missing values" })

            const query = "INSERT INTO cats (name, age) VALUES ($1, $2) RETURNING *";

            const { rows: [cat] } = await pool.query(query, [name, age]);

            res
                .status(201)
                .json(cat);

        } catch (e) {
            console.error(e.message);
            res.json({ error: e.message })
        }

    })

    .put("/:id", (req, res) => {
        const { id } = req.params;
        const { name, age } = req.body;
        if (!name || !age || !id)
            return res.json({ error: "missing values" })

        const query = "UPDATE cats SET name = $1, age = $2 WHERE id = $3 RETURNING *";

        pool
            .query(query, [name, age, id])

            .then(({ rows: [cat] }) => {
                res.json(cat);
            })
            .catch(e => {
                console.error(e.message);
                res.json({ error: e.message })
            })

    })

    .delete("/:id", (req, res) => {
        const { id } = req.params;

        const query = "UPDATE cats SET deleted = TRUE WHERE id = $1";

        pool
            .query(query, [id])

            .then(rows => {
                res.json({message: `cat with id ${id} deleted!`});
            })
            .catch(e => {
                console.error(e.message);
                res.json({ error: e.message })
            })

    })



app.get("/delete-cat/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM cats WHERE id = $1";
    pool
        .query(
            query,
            [id]
        )
        .then(({ rows: cats }) => {
            res.json(cats)
        })
        .catch(e => {
            console.log(e.message);
            res.json(e.message);
        })
}
)

app.listen(8080, () => { console.log("server running") });
