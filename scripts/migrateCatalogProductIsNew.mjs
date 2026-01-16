import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env (prefer .env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

defineMain();

function getMongoUri() {
    return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
}

async function defineMain() {
    const uri = getMongoUri();
    if (!uri) {
        console.error('❌ Missing Mongo URI (MONGODB_URI / MONGO_URI / DATABASE_URL)');
        process.exit(1);
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Connected');

        const collection = mongoose.connection.collection('catalogproducts');

        const query = {
            isNew: { $exists: true },
            isNewProduct: { $exists: false },
        };

        const total = await collection.countDocuments(query);
        console.log(`📦 Found ${total} docs to migrate`);

        if (total === 0) {
            console.log('✅ Nothing to do');
            return;
        }

        const cursor = collection.find(query, { projection: { isNew: 1 } });

        let migrated = 0;
        for await (const doc of cursor) {
            await collection.updateOne(
                { _id: doc._id },
                {
                    $set: { isNewProduct: Boolean(doc.isNew) },
                    $unset: { isNew: '' },
                },
            );
            migrated += 1;

            if (migrated % 250 === 0) {
                console.log(`… migrated ${migrated}/${total}`);
            }
        }

        console.log(`✅ Migrated ${migrated} docs`);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => null);
    }
}
