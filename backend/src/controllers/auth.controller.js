import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req, res) {
    try {
        const {email, password, displayName} = req.body;
        const tokens = await authService.register({email, password, displayName});
        res.status(201).json(tokens);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
  },
  async login(req, res) {
    try{
        const {email, password} = req.body
        const tokens = await authService.login({email, password})
        res.status(200).json(tokens)
    } catch (error){
        res.status(401).json({error: error.message})
    }
  }, 
  async me(req, res){
    try{
        const userId = req.userId
        const user = await authService.me(userId)
        res.status(200).json({displayName : user.display_name, email : user.email})
    } catch (error) {
        res.status(404).json({message : "Un problème est survenu lors de la récupération des données de l'utilisateur !"})
    }
  }, 
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};
