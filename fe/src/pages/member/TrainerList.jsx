import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dumbbell, User, Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainerList = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filters
    const [filters, setFilters] = useState({
        minExp: '',
        gender: '',
        specialization: ''
    });

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.minExp) params.append('minExp', filters.minExp);
            if (filters.gender) params.append('gender', filters.gender);
            if (filters.specialization) params.append('specialization', filters.specialization);

            const res = await axiosClient.get(`/trainers?${params.toString()}`);
            setTrainers(res.data.data); // API returns { status: true, data: [] }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []); // Initial load

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTrainers();
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Find Your Trainer</h1>
            </div>

            {/* Filter Section */}
            <Card className="p-4 bg-slate-50 border-none">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Input
                            name="specialization"
                            placeholder="e.g. Yoga, HIIT"
                            value={filters.specialization}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Min Experience (Years)</Label>
                        <Input
                            name="minExp"
                            type="number"
                            placeholder="e.g. 2"
                            value={filters.minExp}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <select
                            name="gender"
                            value={filters.gender}
                            onChange={handleFilterChange}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        >
                            <option value="">Any</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <Button type="submit" isLoading={loading}>Search Trainers</Button>
                </form>
            </Card>

            {/* Trainers Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trainers.map((trainer) => (
                    <Card key={trainer.trainer_id} className="group hover:shadow-lg transition-all duration-200 border-slate-200">
                        <div className="h-48 bg-slate-100 flex items-center justify-center rounded-t-lg group-hover:bg-slate-200 transition-colors">
                            <User className="w-16 h-16 text-slate-400" />
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{trainer.full_name}</CardTitle>
                                    <p className="text-sm font-medium text-primary-600 mt-1 flex items-center gap-1">
                                        <Dumbbell className="w-3 h-3" /> {trainer.specialization}
                                    </p>
                                </div>
                                {trainer.gender && (
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">{trainer.gender}</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600 line-clamp-2">{trainer.bio || 'No bio available.'}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" /> {trainer.experience_years} Years Exp
                                </span>
                            </div>

                            <Button
                                onClick={() => navigate(`/trainers/${trainer.trainer_id}/book`)}
                                className="w-full"
                                variant="outline"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" /> View Schedule
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!loading && trainers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No trainers match your criteria.</p>
                    <Button variant="link" onClick={() => { setFilters({ minExp: '', gender: '', specialization: '' }); fetchTrainers(); }}>Clear Filters</Button>
                </div>
            )}
        </div>
    );
};

export default TrainerList;
