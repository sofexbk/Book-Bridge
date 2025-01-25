import axios from 'axios';

// Define the base URL for the API
const BASE_URL = 'http://localhost:5154/api/auth';

interface User{
    id: number;
    email: string;
    prenom: string;
    nom: string;
    role: string;
}



class UserService {

    async getAll(): Promise<User[]> {
        const response = await axios.get(`${BASE_URL}/users`,{
            headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    async updateUser(user: User): Promise<void> {
        await axios.put(`${BASE_URL}/users/${user.id}`, user, {
            headers:{
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        }

        async deleteUser(id: number): Promise<void> {
            await axios.delete(`${BASE_URL}/users/${id}`, {
                headers:{
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
        }



}
export default new UserService();
