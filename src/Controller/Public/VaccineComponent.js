import React, { useState, useMemo, useEffect } from 'react';
import { Input, SelectPicker } from 'rsuite';
import HeaderComponent from './Header/HeaderComponent';
import FooterComponent from './FooterComponent';
import axios from 'axios';
import { Link } from 'react-router-dom';

const VaccineProductList = () => {
  const urlapi = process.env.REACT_APP_API_BASE_URL;

  const [initialData, setInitialData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vaccineType, setVaccineType] = useState('all');
  const [ageRange, setAgeRange] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [singleResponse, packResponse] = await Promise.all([
          axios.post(`${urlapi}/api/SingleItem/GetDataPublic`),
          axios.post(`${urlapi}/api/PackageItem/GetDataPublic`),
        ]);

        const singleData = Array.isArray(singleResponse.data.data) 
          ? singleResponse.data.data 
          : [];
        const packData = Array.isArray(packResponse.data.data) 
          ? packResponse.data.data 
          : [];

        const combinedData = [
          ...singleData.map((item) => ({ 
            ...item, 
            Type: 'single',
            Price: item.Price || 0,
            Name: item.Name || 'Không có tên',
            ShortContent: item.ShortContent || '',
            LinkImages: item.LinkImages || '',
            PriceFormat: item.PriceFormat || '0',
            LinkRoute: item.LinkRoute || '',
            AgeType: item.AgeType || 'all'
          })),
          ...packData.map((item) => ({ 
            ...item, 
            Type: 'combo',
            Price: item.Price || 0,
            Name: item.Name || 'Không có tên',
            ShortContent: item.ShortContent || '',
            LinkImages: item.LinkImages || '',
            PriceFormat: item.PriceFormat || '0',
            LinkRoute: item.LinkRoute || '',
            AgeType: item.AgeType || 'all'
          })),
        ];

        setInitialData(combinedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [urlapi]);

  const vaccineTypeData = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Vắc xin lẻ', value: 'single' },
    { label: 'Vắc xin gói', value: 'combo' },
  ];
  const ageRangeData = [
    { label: 'Tất cả độ tuổi', value: 'all' },
    { label: 'Trẻ Em (0-18 tuổi)', value: '0-18' },
    { label: 'Người Trưởng Thành (18-50 tuổi)', value: '18-50' },
    { label: 'Người Cao Tuổi (50-80 tuổi)', value: '50-80' },
  ];
  const priceRangeData = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Dưới 3 triệu', value: '0-3tr' },
    { label: 'Từ 3-5 triệu', value: '3tr-5tr' },
    { label: 'Trên 5 triệu', value: '5tr+' },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setVaccineType('all');
    setAgeRange('all');
    setPriceRange('all');
  };

  // Bộ lọc dữ liệu
  const filteredVaccines = useMemo(() => {
    if (
      searchTerm === '' && 
      vaccineType === 'all' && 
      ageRange === 'all' && 
      priceRange === 'all'
    ) {
      return initialData;
    }

    return initialData.filter((vaccine) => {
      const matchesSearch = searchTerm === '' || 
        vaccine.Name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = vaccineType === 'all' || 
        (vaccineType === 'single' && vaccine.Type === 'single') || 
        (vaccineType === 'combo' && vaccine.Type === 'combo');
      
      const matchesAge = ageRange === 'all' || 
        (ageRange === '0-18' && (vaccine.AgeType === '0-18' || vaccine.TypePack?.includes('0-18'))) ||
        (ageRange === '18-50' && (vaccine.AgeType === '18-50' || vaccine.TypePack?.includes('18-50'))) ||
        (ageRange === '50-80' && (vaccine.AgeType === '50-80' || vaccine.TypePack?.includes('50-80')));
      
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === '0-3tr' && vaccine.Price < 3000000) ||
        (priceRange === '3tr-5tr' && vaccine.Price >= 3000000 && vaccine.Price < 5000000) ||
        (priceRange === '5tr+' && vaccine.Price >= 5000000);

      return matchesSearch && matchesType && matchesAge && matchesPrice;
    });
  }, [searchTerm, vaccineType, ageRange, priceRange, initialData]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      <HeaderComponent />
      <div className="container mx-auto p-4">
        {/* Nút hamburger menu cho thiết bị di động */}
        <div className="md:hidden mb-4 flex justify-end">
          <button onClick={toggleMobileMenu} className="p-2 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-4 mb-6 ${isMobileMenuOpen ? 'block' : 'hidden'} md:grid md:grid-cols-2 lg:grid-cols-4 md:block`}>
          <div>
            <label className='font-semibold py-2'>Tìm kiếm</label>
            <Input
              placeholder="Tìm kiếm vắc xin..."
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              className="w-full"
            />
          </div>
          <div>
            <label className='font-semibold py-2'>Loại vắc xin</label>
            <SelectPicker
              data={vaccineTypeData}
              searchable={false}
              value={vaccineType}
              onChange={setVaccineType}
              placeholder="Loại vắc xin"
              className="w-full"
            />
          </div>
          <div>
            <label className='font-semibold py-2'>Độ tuổi</label>
            <SelectPicker
              data={ageRangeData}
              searchable={false}
              value={ageRange}
              onChange={setAgeRange}
              placeholder="Độ tuổi"
              className="w-full"
            />
          </div>
          <div>
            <label className='font-semibold py-2'>Mức giá</label>
            <SelectPicker
              data={priceRangeData}
              searchable={false}
              value={priceRange}
              onChange={setPriceRange}
              placeholder="Mức giá"
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-4 text-right">
          <button 
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Đặt lại bộ lọc
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVaccines.map((vaccine) => (
            <div key={vaccine.ID} className="bg-white border rounded-lg shadow-md overflow-hidden transition-transform hover:border-blue-600 hover:shadow-xl">
              <img 
                src={vaccine.LinkImages} 
                alt={vaccine.Name} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/default-vaccine-image.png';
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 truncate">{vaccine.Name}</h3>
                <p className="text-sm text-gray-600 mb-2">{vaccine.ShortContent}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-600 font-semibold">{vaccine.PriceFormat} VNĐ</span>
                </div>
                <Link
                  to={`/vaccine/${vaccine.LinkRoute}`}
                  className="block w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredVaccines.length === 0 && <div className="text-center text-gray-500 mt-8">Không tìm thấy vắc xin phù hợp</div>}
      </div>
      <FooterComponent />
    </>
  );
};

export default VaccineProductList;