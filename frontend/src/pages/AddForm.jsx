import React, {useContext, useState} from 'react';
import axios from 'axios';
import styles from '../styles/addForm.module.css';
import AuthContext from "../components/AuthProvider";

const WatcherForm = () => {
    const { auth } = useContext(AuthContext);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [material, setMaterial] = useState('');
    const [discount, setDiscount] = useState('');
    const [brand, setBrand] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const watcherData = {
            product_name: productName,
            price: price,
            description: description,
            material: material,
            discount: discount,
            brand: brand,
            stock: stock,
            image_url: imageUrl,
        };

        try {
            const response = await axios.post(`http://localhost:3001/api/watchers/${auth.user_id}`, watcherData, {
                withCredentials: true
            });

            if (response.status === 201) {
                setMessage('Годинник успішно створено!');
                setIsSuccess(true);
            } else {
                setMessage('Сталася помилка при створенні.');
                setIsSuccess(false);
            }
        } catch (error) {
            setMessage('Помилка сервера');
            setIsSuccess(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.heading}>Створити новий Watcher</h2>
            <form onSubmit={handleSubmit}>
                <label className={styles.productNameLabel}>Назва продукту</label>
                <input
                    className={styles.productNameInput}
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                />

                <label className={styles.priceLabel}>Ціна</label>
                <input
                    className={styles.priceInput}
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <label className={styles.descriptionLabel}>Опис</label>
                <textarea
                    className={styles.descriptionTextarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <label className={styles.materialLabel}>Матеріал</label>
                <input
                    className={styles.materialInput}
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                />

                <label className={styles.discountLabel}>Знижка</label>
                <input
                    className={styles.discountInput}
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                />

                <label className={styles.brandLabel}>Бренд</label>
                <input
                    className={styles.brandInput}
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                />

                <label className={styles.stockLabel}>Кількість на складі</label>
                <input
                    className={styles.stockInput}
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />

                <label className={styles.imageUrlLabel}>URL зображення</label>
                <input
                    className={styles.imageUrlInput}
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />

                <button className={styles.submitButton} type="submit">Створити</button>
            </form>

            {message && (
                <div className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default WatcherForm;
